<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Courier;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Laundry;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Settlement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentAndSettlementApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $customerUser;
    protected Customer $customer;
    protected User $managerUser;
    protected Laundry $laundry;
    protected User $courierUser;
    protected Courier $courier;
    protected User $adminUser;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        // Customer & Address
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

        // Courier
        $this->courierUser = User::factory()->create(['name' => 'Courier Test']);
        $this->courier = Courier::create([
            'user_id' => $this->courierUser->id,
            'courier_type' => 'freelance',
            'status' => 'ACTIVE',
        ]);

        // Admin User
        $this->adminUser = User::factory()->create(['name' => 'Admin Test']);
        \App\Models\AdminUser::create(['user_id' => $this->adminUser->id, 'role' => 'FINANCE_ADMIN']);

        // Order
        $this->order = Order::create([
            'order_number' => 'LDR-2026-000300',
            'customer_id' => $this->customer->id,
            'laundry_id' => $this->laundry->id,
            'pickup_address_id' => $address->id,
            'delivery_address_id' => $address->id,
            'status' => 'DRAFT',
            'estimated_total' => 50000,
            'currency' => 'IDR',
            'scheduled_pickup_start' => now(),
            'scheduled_pickup_end' => now()->addHour(),
        ]);
    }

    public function test_customer_can_charge_payment_and_simulate_paid(): void
    {
        // 1. Charge
        $chargeResponse = $this->actingAs($this->customerUser)
            ->postJson("/api/v1/orders/{$this->order->id}/payments/charge", [
                'payment_type' => 'qris',
            ]);

        $chargeResponse->assertStatus(201)
            ->assertJsonPath('payment.status', 'PENDING')
            ->assertJsonStructure(['payment', 'snap_token']);

        $paymentId = $chargeResponse->json('payment.id');

        $this->assertDatabaseHas('invoices', [
            'order_id' => $this->order->id,
            'status' => 'UNPAID',
        ]);

        // 2. Simulate Payment Success
        $simResponse = $this->actingAs($this->customerUser)
            ->postJson("/api/v1/payments/{$paymentId}/simulate");

        $simResponse->assertStatus(200)
            ->assertJsonPath('payment.status', 'PAID');

        $this->assertDatabaseHas('invoices', [
            'order_id' => $this->order->id,
            'status' => 'PAID',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'CONFIRMED',
        ]);
    }

    public function test_idempotent_webhook_processing(): void
    {
        $payment = Payment::create([
            'order_id' => $this->order->id,
            'payment_number' => 'PAY-TEST-001',
            'provider' => 'MIDTRANS',
            'provider_reference' => 'MIDTRANS-REF-001',
            'amount' => 62000,
            'status' => 'PENDING',
        ]);

        // First webhook call
        $response1 = $this->postJson('/api/v1/payments/webhook', [
            'order_id' => 'PAY-TEST-001',
            'transaction_id' => 'MIDTRANS-REF-001',
            'transaction_status' => 'settlement',
        ]);

        $response1->assertStatus(200)
            ->assertJsonPath('message', 'Webhook processed successfully.');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'PAID',
        ]);

        // Duplicate second webhook call (idempotent lock)
        $response2 = $this->postJson('/api/v1/payments/webhook', [
            'order_id' => 'PAY-TEST-001',
            'transaction_id' => 'MIDTRANS-REF-001',
            'transaction_status' => 'settlement',
        ]);

        $response2->assertStatus(200)
            ->assertJsonPath('message', 'Idempotent response: Payment already processed.');
    }

    public function test_laundry_and_courier_settlement_workflow(): void
    {
        // 1. Laundry request settlement
        $settleResponse = $this->actingAs($this->managerUser)
            ->postJson('/api/v1/laundry/settlements/request', [
                'amount' => 100000,
                'bank_name' => 'BCA',
                'account_number' => '123456789',
                'account_holder' => 'Manager Test',
            ]);

        $settleResponse->assertStatus(201)
            ->assertJsonPath('settlement.status', 'PENDING');

        $settlementId = $settleResponse->json('settlement.id');

        // 2. Admin finance approves settlement
        $approveResponse = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/admin/settlements/{$settlementId}/approve");

        $approveResponse->assertStatus(200)
            ->assertJsonPath('settlement.status', 'PAID');

        $this->assertDatabaseHas('settlements', [
            'id' => $settlementId,
            'status' => 'PAID',
        ]);
    }
}
