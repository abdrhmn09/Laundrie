<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Customer;
use App\Models\Laundry;
use App\Models\Order;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WeighingApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $customerUser;
    protected Customer $customer;
    protected User $managerUser;
    protected Laundry $laundry;
    protected User $staffUser;
    protected Staff $staff;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');

        // Customer
        $this->customerUser = User::factory()->create(['name' => 'Customer Test']);
        $this->customer = Customer::create(['user_id' => $this->customerUser->id, 'name' => 'Customer Test', 'phone' => '081111111']);
        $address = Address::create([
            'customer_id' => $this->customer->id,
            'recipient_name' => 'Customer',
            'phone' => '081111111',
            'address_line' => 'Jl. Merdeka 123',
        ]);

        // Laundry Manager
        $this->managerUser = User::factory()->create(['name' => 'Manager Test']);
        $this->laundry = Laundry::create([
            'user_id' => $this->managerUser->id,
            'business_name' => 'Laundry Flash',
            'address_line' => 'Jl. Sudirman 45',
            'contact_phone' => '082222222',
            'status' => 'ACTIVE',
        ]);

        // Staff
        $this->staffUser = User::factory()->create(['name' => 'Staff Test']);
        $this->staff = Staff::create([
            'user_id' => $this->staffUser->id,
            'laundry_id' => $this->laundry->id,
            'role' => 'STAFF',
            'status' => 'ACTIVE',
        ]);

        // Order at RECEIVED_AT_LAUNDRY
        $this->order = Order::create([
            'order_number' => 'LDR-2026-000100',
            'customer_id' => $this->customer->id,
            'laundry_id' => $this->laundry->id,
            'pickup_address_id' => $address->id,
            'delivery_address_id' => $address->id,
            'status' => 'RECEIVED_AT_LAUNDRY',
            'estimated_weight' => 5.00,
            'estimated_total' => 50000,
            'currency' => 'IDR',
            'scheduled_pickup_start' => now(),
            'scheduled_pickup_end' => now()->addHour(),
        ]);
    }

    public function test_staff_can_record_weight_and_evidence(): void
    {
        $file = UploadedFile::fake()->image('weighing_scale.jpg', 600, 600);

        $response = $this->actingAs($this->staffUser)
            ->postJson("/api/v1/orders/{$this->order->id}/weighing/record", [
                'actual_weight' => 5.20, // 4% variance -> auto finalize
                'photo' => $file,
                'latitude' => -6.200000,
                'longitude' => 106.816666,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('order_status', 'PRICE_FINALIZED')
            ->assertJsonStructure([
                'message',
                'measurement' => ['id', 'actual_value', 'status'],
                'evidence' => ['id', 'photo_path', 'photo_hash', 'status'],
                'order_status',
            ]);

        $this->assertDatabaseHas('weight_measurements', [
            'order_id' => $this->order->id,
            'actual_value' => 5.20,
            'status' => 'VERIFIED',
        ]);

        $this->assertDatabaseHas('weight_evidences', [
            'order_id' => $this->order->id,
            'weight' => 5.20,
            'status' => 'CONFIRMED',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'actual_weight' => 5.20,
            'status' => 'PRICE_FINALIZED',
        ]);
    }

    public function test_variance_over_30_percent_triggers_weight_review_required(): void
    {
        $file = UploadedFile::fake()->image('scale_big.jpg', 600, 600);

        $response = $this->actingAs($this->staffUser)
            ->postJson("/api/v1/orders/{$this->order->id}/weighing/record", [
                'actual_weight' => 8.50, // 70% variance -> requires review
                'photo' => $file,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('order_status', 'WEIGHT_REVIEW_REQUIRED');

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'WEIGHT_REVIEW_REQUIRED',
            'actual_weight' => 8.50,
        ]);
    }

    public function test_customer_can_confirm_weight_review(): void
    {
        $this->order->update([
            'status' => 'WEIGHT_REVIEW_REQUIRED',
            'actual_weight' => 8.50,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/v1/orders/{$this->order->id}/weighing/confirm");

        $response->assertStatus(200)
            ->assertJsonPath('order_status', 'PRICE_FINALIZED');

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'PRICE_FINALIZED',
        ]);
    }

    public function test_manager_can_invalidate_evidence_for_reweighing(): void
    {
        $this->order->update(['status' => 'PRICE_FINALIZED', 'actual_weight' => 5.20]);

        $response = $this->actingAs($this->managerUser)
            ->postJson("/api/v1/orders/{$this->order->id}/weighing/invalidate", [
                'reason' => 'Pakaian basah tertukar saat penimbangan pertama',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('order_status', 'WEIGHING_REQUIRED');

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'WEIGHING_REQUIRED',
            'actual_weight' => null,
        ]);
    }
}
