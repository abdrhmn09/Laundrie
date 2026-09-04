<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Complaint;
use App\Models\Courier;
use App\Models\CourierJob;
use App\Models\Customer;
use App\Models\Laundry;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ComplaintAndReviewApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $customerUser;
    protected Customer $customer;
    protected Laundry $laundry;
    protected Order $order;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->customerUser = User::factory()->create(['name' => 'Customer Test']);
        $this->customer = Customer::create(['user_id' => $this->customerUser->id, 'name' => 'Customer Test', 'phone' => '081111111']);
        $address = Address::create([
            'customer_id' => $this->customer->id,
            'recipient_name' => 'Customer',
            'phone' => '081111111',
            'address_line' => 'Jl. Merdeka 123',
        ]);

        $managerUser = User::factory()->create(['name' => 'Manager Test']);
        $this->laundry = Laundry::create([
            'user_id' => $managerUser->id,
            'business_name' => 'Laundry Flash',
            'address_line' => 'Jl. Sudirman 45',
            'contact_phone' => '082222222',
            'status' => 'ACTIVE',
        ]);

        $this->adminUser = User::factory()->create(['name' => 'Admin Test']);
        \App\Models\AdminUser::create(['user_id' => $this->adminUser->id, 'role' => 'OPERATIONS_ADMIN']);

        $this->order = Order::create([
            'order_number' => 'LDR-2026-000400',
            'customer_id' => $this->customer->id,
            'laundry_id' => $this->laundry->id,
            'pickup_address_id' => $address->id,
            'delivery_address_id' => $address->id,
            'status' => 'COMPLETED',
            'estimated_total' => 50000,
            'currency' => 'IDR',
            'scheduled_pickup_start' => now()->subDay(),
            'scheduled_pickup_end' => now()->subDay()->addHour(),
        ]);
    }

    // ─── Complaint Tests ─────────────────────────────────────────────────────

    public function test_customer_can_submit_complaint_with_evidence(): void
    {
        $photo = UploadedFile::fake()->image('damaged_shirt.jpg', 800, 600);

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/v1/orders/{$this->order->id}/complaints", [
                'category' => 'damaged',
                'description' => 'Kemeja saya luntur setelah dicuci, ada noda biru di kerah.',
                'requested_resolution' => 'REFUND',
                'evidence_photo' => $photo,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('complaint.status', 'SUBMITTED')
            ->assertJsonPath('complaint.category', 'damaged');

        $complaintId = $response->json('complaint.id');

        $this->assertDatabaseHas('complaints', [
            'id' => $complaintId,
            'order_id' => $this->order->id,
            'category' => 'damaged',
            'status' => 'SUBMITTED',
        ]);

        $this->assertDatabaseHas('dispute_evidences', [
            'complaint_id' => $complaintId,
        ]);

        // Should auto-create notification
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->customerUser->id,
            'type' => 'COMPLAINT_UPDATE',
        ]);
    }

    public function test_admin_can_arbitrate_and_resolve_complaint(): void
    {
        $complaint = Complaint::create([
            'order_id' => $this->order->id,
            'customer_id' => $this->customer->id,
            'category' => 'item_lost',
            'description' => 'Kemeja putih favorit saya hilang setelah proses cuci.',
            'requested_resolution' => 'COMPENSATION',
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/admin/complaints/{$complaint->id}/resolve", [
                'status' => 'RESOLVED_REFUND',
                'resolution_notes' => 'Setelah investigasi, mitra laundry mengakui kesalahan. Refund disetujui.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('complaint.status', 'RESOLVED_REFUND');

        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'status' => 'RESOLVED_REFUND',
            'resolved_by' => $this->adminUser->id,
        ]);

        // Customer should receive notification
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->customerUser->id,
            'type' => 'COMPLAINT_UPDATE',
        ]);
    }

    // ─── Review Tests ─────────────────────────────────────────────────────────

    public function test_customer_can_submit_review_for_completed_order(): void
    {
        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/v1/orders/{$this->order->id}/reviews", [
                'laundry_rating' => 4,
                'courier_rating' => 5,
                'comment' => 'Cuci bersih, pengantaran tepat waktu. Sangat puas!',
                'is_anonymous' => false,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('review.laundry_rating', 4)
            ->assertJsonPath('review.courier_rating', 5);

        $this->assertDatabaseHas('reviews', [
            'order_id' => $this->order->id,
            'laundry_id' => $this->laundry->id,
            'laundry_rating' => 4,
            'courier_rating' => 5,
        ]);
    }

    public function test_review_rejected_for_non_completed_order(): void
    {
        $this->order->update(['status' => 'CONFIRMED']);

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/v1/orders/{$this->order->id}/reviews", [
                'laundry_rating' => 3,
            ]);

        $response->assertStatus(422);
    }

    // ─── Notification Tests ───────────────────────────────────────────────────

    public function test_user_can_list_and_mark_notifications_read(): void
    {
        $n1 = Notification::create([
            'user_id' => $this->customerUser->id,
            'title' => 'Pesanan Dikonfirmasi',
            'body' => 'Order LDR-2026-000400 telah dikonfirmasi.',
            'type' => 'ORDER_STATUS',
        ]);

        $n2 = Notification::create([
            'user_id' => $this->customerUser->id,
            'title' => 'Kurir Menuju Lokasi',
            'body' => 'Kurir sedang dalam perjalanan menjemput pakaian Anda.',
            'type' => 'ORDER_STATUS',
        ]);

        // List notifications
        $listResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/v1/notifications');

        $listResponse->assertStatus(200)
            ->assertJsonPath('unread_count', 2)
            ->assertJsonCount(2, 'notifications');

        // Mark single read
        $this->actingAs($this->customerUser)
            ->postJson("/api/v1/notifications/{$n1->id}/read")
            ->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'id' => $n1->id,
            'read_at' => now()->toDateTimeString(),
        ]);

        // Mark all read
        $this->actingAs($this->customerUser)
            ->postJson('/api/v1/notifications/read-all')
            ->assertStatus(200);

        $this->assertEquals(0,
            Notification::where('user_id', $this->customerUser->id)->whereNull('read_at')->count()
        );
    }
}
