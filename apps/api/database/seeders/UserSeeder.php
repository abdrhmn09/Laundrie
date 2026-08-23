<?php

namespace Database\Seeders;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Auth\Enums\UserStatus;
use App\Models\AdminUser;
use App\Models\Courier;
use App\Models\Customer;
use App\Models\Laundry;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        $users = [
            [
                'name' => 'Abdurrahman Marzuki (Super Admin)',
                'email' => 'abdurrahman.marzuki09@gmail.com',
                'phone' => '081269000001',
                'password' => $defaultPassword,
                'role' => UserRole::SuperAdmin->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Admin Ops)',
                'email' => 'abdurrahmanmarzuki24@gmail.com',
                'phone' => '081269000002',
                'password' => $defaultPassword,
                'role' => UserRole::OperationsAdmin->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Admin Finance)',
                'email' => 'abdur.rhmn.mrzk@gmail.com',
                'phone' => '081269000003',
                'password' => $defaultPassword,
                'role' => UserRole::FinanceAdmin->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Manajer Outlet)',
                'email' => 'abdurrahmanmarzuki2@gmail.com',
                'phone' => '081269000004',
                'password' => $defaultPassword,
                'role' => UserRole::Manager->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Abdurrahman Marzuki (Staf Operasional)',
                'email' => 'a.marzuki@mhs.usk.ac.id',
                'phone' => '081269000005',
                'password' => $defaultPassword,
                'role' => UserRole::Staff->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Gold D. Roger (Kurir Express)',
                'email' => 'gold.d.rogerr7@gmail.com',
                'phone' => '081269000006',
                'password' => $defaultPassword,
                'role' => UserRole::Courier->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Naruto Uzumaki (Pelanggan VIP)',
                'email' => 'uzmk.naruto19@gmail.com',
                'phone' => '081269000007',
                'password' => $defaultPassword,
                'role' => UserRole::Customer->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Johan Zuzki (Pelanggan - Email Unverified)',
                'email' => 'johan.lbrt19@gmail.com',
                'phone' => '081269000008',
                'password' => $defaultPassword,
                'role' => UserRole::Customer->value,
                'status' => UserStatus::EmailUnverified->value,
                'email_verified_at' => null,
                'phone_verified_at' => null,
            ],
            [
                'name' => 'Greyash Wolfe (Pelanggan Regular)',
                'email' => 'wolfegreyash@gmail.com',
                'phone' => '081269000009',
                'password' => $defaultPassword,
                'role' => UserRole::Customer->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'name' => 'Blang Kubu Peudada (Mitra / Komunitas)',
                'email' => 'blangkubu.peudada.kkn@gmail.com',
                'phone' => '081269000010',
                'password' => $defaultPassword,
                'role' => UserRole::Customer->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // One Account, Multiple Capabilities: every user is also a customer (PRD §5)
            Customer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                ]
            );
        }

        // ── One Account, Multiple Capabilities — seed related tables per Schema.md ──
        // Manager: abdurrahmanmarzuki2@gmail.com owns one laundry (PRD §8, Schema §4.7)
        $manager = User::where('email', 'abdurrahmanmarzuki2@gmail.com')->first();
        if ($manager) {
            $laundry = Laundry::updateOrCreate(
                ['user_id' => $manager->id],
                [
                    'business_name' => 'Laundrie Express Peudada',
                    'legal_name' => 'CV Laundrie Peudada',
                    'address_line' => 'Jl. Merdeka No. 10, Peudada, Bireuen, Aceh',
                    'latitude' => 5.2000,
                    'longitude' => 96.7000,
                    'operating_hours' => ['open' => '07:00', 'close' => '21:00'],
                    'status' => 'ACTIVE',
                    'contact_phone' => '081269000004',
                    'contact_email' => 'peudada@laundrie.id',
                ]
            );

            // Staff: a.marzuki@mhs.usk.ac.id is staff at that laundry (Schema §4.3)
            $staffUser = User::where('email', 'a.marzuki@mhs.usk.ac.id')->first();
            if ($staffUser) {
                Staff::updateOrCreate(
                    ['user_id' => $staffUser->id, 'laundry_id' => $laundry->id],
                    ['role' => 'STAFF', 'status' => 'ACTIVE']
                );

                // Staff + Courier: make the same staff also a laundry_staff courier (PRD §12.3, Schema §4.6)
                Courier::updateOrCreate(
                    ['user_id' => $staffUser->id],
                    [
                        'laundry_id' => $laundry->id,
                        'courier_type' => 'laundry_staff',
                        'vehicle_type' => 'motor',
                        'service_area' => ['Peudada', 'Jeunieb'],
                        'status' => 'ACTIVE',
                    ]
                );
            }
        }

        // Freelance Courier: Gold D. Roger (Schema §4.6 freelance, laundry_id NULL)
        $freelance = User::where('email', 'gold.d.rogerr7@gmail.com')->first();
        if ($freelance) {
            Courier::updateOrCreate(
                ['user_id' => $freelance->id],
                [
                    'laundry_id' => null,
                    'courier_type' => 'freelance',
                    'vehicle_type' => 'motor',
                    'service_area' => ['Banda Aceh', 'Darussalam'],
                    'status' => 'ACTIVE',
                ]
            );
        }

        // Admin users: link to admin_users table (Schema §4.27)
        $adminMap = [
            'abdurrahman.marzuki09@gmail.com' => 'SUPER_ADMIN',
            'abdurrahmanmarzuki24@gmail.com' => 'OPERATIONS_ADMIN',
            'abdur.rhmn.mrzk@gmail.com' => 'FINANCE_ADMIN',
        ];
        foreach ($adminMap as $email => $role) {
            $admin = User::where('email', $email)->first();
            if ($admin) {
                AdminUser::updateOrCreate(
                    ['user_id' => $admin->id],
                    ['role' => $role]
                );
            }
        }
    }
}
