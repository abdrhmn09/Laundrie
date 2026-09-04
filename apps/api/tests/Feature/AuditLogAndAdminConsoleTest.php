<?php

namespace Tests\Feature;

use App\Domain\Admin\Services\AuditLogService;
use App\Models\Address;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Laundry;
use App\Models\Order;
use App\Models\PlatformConfig;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogAndAdminConsoleTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create(['name' => 'Super Admin Test']);
        \App\Models\AdminUser::create(['user_id' => $this->adminUser->id, 'role' => 'SUPER_ADMIN']);

        $managerUser = User::factory()->create();
        $laundry = Laundry::create([
            'user_id' => $managerUser->id,
            'business_name' => 'Laundry Test Express',
            'address_line' => 'Jl. Sudirman 1',
            'contact_phone' => '082222222',
            'status' => 'ACTIVE',
        ]);

        $customerUser = User::factory()->create();
        $customer = Customer::create(['user_id' => $customerUser->id, 'name' => 'Customer', 'phone' => '081']);
        $address = Address::create([
            'customer_id' => $customer->id, 'recipient_name' => 'Test',
            'phone' => '081', 'address_line' => 'Jl. Test',
        ]);

        $this->order = Order::create([
            'order_number' => 'LDR-2026-000500',
            'customer_id' => $customer->id,
            'laundry_id' => $laundry->id,
            'pickup_address_id' => $address->id,
            'delivery_address_id' => $address->id,
            'status' => 'CONFIRMED',
            'estimated_total' => 50000,
            'currency' => 'IDR',
            'scheduled_pickup_start' => now(),
            'scheduled_pickup_end' => now()->addHour(),
        ]);
    }

    // ─── AuditLogService Unit ────────────────────────────────────────────────

    public function test_audit_log_service_records_immutable_entry(): void
    {
        AuditLogService::record(
            userId: $this->adminUser->id,
            actorRole: 'SUPER_ADMIN',
            context: [
                'action'        => 'config.updated',
                'subject_type'  => 'PlatformConfig',
                'subject_id'    => 1,
                'justification' => 'Testing audit log immutable recording.',
                'before_state'  => ['value' => '0.10'],
                'after_state'   => ['value' => '0.15'],
            ],
        );

        $this->assertDatabaseHas('audit_logs', [
            'user_id'      => $this->adminUser->id,
            'actor_role'   => 'SUPER_ADMIN',
            'action'       => 'config.updated',
            'subject_type' => 'PlatformConfig',
        ]);

        // Verify before/after JSON stored correctly
        $log = AuditLog::where('action', 'config.updated')->first();
        $this->assertEquals(['value' => '0.10'], $log->before_state);
        $this->assertEquals(['value' => '0.15'], $log->after_state);
    }

    // ─── Admin Order Override ────────────────────────────────────────────────

    public function test_admin_can_override_order_status_with_justification(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/admin/orders/{$this->order->id}/override", [
                'new_status'    => 'CANCELLED',
                'justification' => 'Pelanggan meminta pembatalan melalui telepon CS, telah diverifikasi.',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id'     => $this->order->id,
            'status' => 'CANCELLED',
        ]);

        // Must produce immutable audit log
        $this->assertDatabaseHas('audit_logs', [
            'user_id'      => $this->adminUser->id,
            'action'       => 'order.manual_override',
            'subject_type' => 'Order',
            'subject_id'   => $this->order->id,
        ]);

        // Order status history must be recorded
        $this->assertDatabaseHas('order_status_histories', [
            'order_id'    => $this->order->id,
            'from_status' => 'CONFIRMED',
            'to_status'   => 'CANCELLED',
        ]);
    }

    public function test_order_override_fails_without_justification(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/admin/orders/{$this->order->id}/override", [
                'new_status' => 'CANCELLED',
                // justification missing
            ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'order.manual_override']);
    }

    // ─── Platform Config (Super Admin) ───────────────────────────────────────

    public function test_super_admin_can_upsert_platform_config_with_audit(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/admin/configs', [
                'key'           => 'platform_commission_rate',
                'value'         => '0.12',
                'type'          => 'decimal',
                'group'         => 'settlement',
                'description'   => 'Platform commission at 12%',
                'is_public'     => false,
                'justification' => 'Kenaikan komisi dari 10% ke 12% sesuai keputusan manajemen Q4 2026.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('config.value', '0.12');

        $this->assertDatabaseHas('platform_configs', [
            'key'   => 'platform_commission_rate',
            'value' => '0.12',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action'      => 'config.updated',
            'subject_type'=> 'PlatformConfig',
        ]);
    }

    // ─── Audit Log Viewer ────────────────────────────────────────────────────

    public function test_admin_can_view_audit_log_list(): void
    {
        AuditLogService::record(
            userId: $this->adminUser->id,
            actorRole: 'OPERATIONS_ADMIN',
            context: ['action' => 'complaint.resolved', 'subject_type' => 'Complaint', 'subject_id' => 99],
        );

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'total', 'current_page']);

        $this->assertGreaterThan(0, $response->json('total'));
    }
}
