<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Courier;
use App\Models\CourierJob;
use App\Models\Customer;
use App\Models\Laundry;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CourierJobApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $courierUser;
    protected Courier $courier;
    protected User $customerUser;
    protected Customer $customer;
    protected Laundry $laundry;
    protected Order $order;
    protected CourierJob $job;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        // Customer & Address
        $this->customerUser = User::factory()->create(['name' => 'Customer Test']);
        $this->customer = Customer::create(['user_id' => $this->customerUser->id, 'name' => 'Customer Test', 'phone' => '081111111']);
        $address = Address::create([
            'customer_id' => $this->customer->id,
            'recipient_name' => 'Customer',
            'phone' => '081111111',
            'address_line' => 'Jl. Merdeka 123',
        ]);

        // Laundry
        $managerUser = User::factory()->create(['name' => 'Manager Test']);
        $this->laundry = Laundry::create([
            'user_id' => $managerUser->id,
            'business_name' => 'Laundry Express',
            'address_line' => 'Jl. Sudirman 45',
            'contact_phone' => '082222222',
            'status' => 'ACTIVE',
        ]);

        // Courier
        $this->courierUser = User::factory()->create(['name' => 'Courier Test']);
        $this->courier = Courier::create([
            'user_id' => $this->courierUser->id,
            'courier_type' => 'freelance',
            'status' => 'ACTIVE',
        ]);

        // Order & CourierJob
        $this->order = Order::create([
            'order_number' => 'LDR-2026-000200',
            'customer_id' => $this->customer->id,
            'laundry_id' => $this->laundry->id,
            'pickup_address_id' => $address->id,
            'delivery_address_id' => $address->id,
            'status' => 'CONFIRMED',
            'estimated_total' => 45000,
            'currency' => 'IDR',
            'scheduled_pickup_start' => now(),
            'scheduled_pickup_end' => now()->addHour(),
        ]);

        $this->job = CourierJob::create([
            'order_id' => $this->order->id,
            'job_type' => 'PICKUP',
            'status' => 'DISPATCHED',
            'notes' => 'Tugas Penjemputan Otomatis',
        ]);
    }

    public function test_courier_can_view_available_jobs_and_accept(): void
    {
        $response = $this->actingAs($this->courierUser)
            ->getJson('/api/v1/courier/jobs?type=available');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'jobs')
            ->assertJsonPath('jobs.0.id', $this->job->id);

        $acceptResponse = $this->actingAs($this->courierUser)
            ->postJson("/api/v1/courier/jobs/{$this->job->id}/accept");

        $acceptResponse->assertStatus(200)
            ->assertJsonPath('job.status', 'ACCEPTED')
            ->assertJsonPath('job.courier_id', $this->courier->id);

        $this->assertDatabaseHas('courier_jobs', [
            'id' => $this->job->id,
            'courier_id' => $this->courier->id,
            'status' => 'ACCEPTED',
        ]);
    }

    public function test_courier_can_update_status_to_in_transit_and_completed(): void
    {
        $this->job->update([
            'courier_id' => $this->courier->id,
            'status' => 'ACCEPTED',
            'accepted_at' => now(),
        ]);

        // 1. Transit
        $transitResponse = $this->actingAs($this->courierUser)
            ->postJson("/api/v1/courier/jobs/{$this->job->id}/status", [
                'status' => 'IN_TRANSIT',
                'latitude' => -6.200000,
                'longitude' => 106.816666,
            ]);

        $transitResponse->assertStatus(200)
            ->assertJsonPath('job.status', 'IN_TRANSIT');

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'PICKUP_IN_PROGRESS',
        ]);

        // 2. Complete with proof photo
        $file = UploadedFile::fake()->image('pickup_proof.jpg', 600, 600);

        $completeResponse = $this->actingAs($this->courierUser)
            ->postJson("/api/v1/courier/jobs/{$this->job->id}/status", [
                'status' => 'COMPLETED',
                'proof_photo' => $file,
                'notes' => 'Pakaian diterima dengan aman',
            ]);

        $completeResponse->assertStatus(200)
            ->assertJsonPath('job.status', 'COMPLETED');

        $this->assertDatabaseHas('courier_jobs', [
            'id' => $this->job->id,
            'status' => 'COMPLETED',
            'notes' => 'Pakaian diterima dengan aman',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'RECEIVED_AT_LAUNDRY',
        ]);
    }
}
