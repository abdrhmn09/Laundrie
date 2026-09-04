<?php

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Services\AuditLogService;
use App\Http\Controllers\Controller;
use App\Models\PlatformConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    /**
     * List all platform configs (Super Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $group = $request->input('group');

        $configs = PlatformConfig::with('updater:id,name')
            ->when($group, fn($q) => $q->where('group', $group))
            ->orderBy('group')
            ->orderBy('key')
            ->get();

        return response()->json([
            'configs' => $configs,
        ]);
    }

    /**
     * Upsert a platform config value with full audit trail
     */
    public function upsert(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'key'         => 'required|string|max:100',
            'value'       => 'required|string',
            'type'        => 'nullable|in:string,integer,decimal,boolean,json',
            'group'       => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_public'   => 'nullable|boolean',
            'justification' => 'required|string|min:10',
        ]);

        $before = PlatformConfig::where('key', $request->input('key'))->first();

        $config = PlatformConfig::updateOrCreate(
            ['key' => $request->input('key')],
            [
                'value'       => $request->input('value'),
                'type'        => $request->input('type', $before?->type ?? 'string'),
                'group'       => $request->input('group', $before?->group ?? 'general'),
                'description' => $request->input('description', $before?->description),
                'is_public'   => $request->boolean('is_public', $before?->is_public ?? false),
                'updated_by'  => $user->id,
            ]
        );

        AuditLogService::record(
            userId: $user->id,
            actorRole: 'SUPER_ADMIN',
            context: [
                'action'        => 'config.updated',
                'subject_type'  => 'PlatformConfig',
                'subject_id'    => $config->id,
                'justification' => $request->input('justification'),
                'before_state'  => $before ? ['value' => $before->value] : null,
                'after_state'   => ['value' => $config->value],
            ],
            request: $request,
        );

        return response()->json([
            'message' => "Konfigurasi platform '{$config->key}' berhasil diperbarui.",
            'config'  => $config->fresh('updater'),
        ]);
    }

    /**
     * Get a single public config by key (accessible without admin auth)
     */
    public function publicConfig(string $key): JsonResponse
    {
        $config = PlatformConfig::where('key', $key)
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json([
            'key'   => $config->key,
            'value' => $config->typedValue(),
            'type'  => $config->type,
        ]);
    }
}
