<?php

namespace App\Domain\Review\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Submit review for a completed order
     */
    public function store(Request $request, int $orderId): JsonResponse
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Bukan akun pelanggan.'], 403);
        }

        $order = Order::where('customer_id', $customer->id)->findOrFail($orderId);

        if ($order->status !== 'COMPLETED') {
            return response()->json(['message' => 'Ulasan hanya dapat diberikan setelah pesanan selesai (COMPLETED).'], 422);
        }

        $request->validate([
            'laundry_rating' => 'required|integer|min:1|max:5',
            'courier_rating' => 'nullable|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $review = Review::updateOrCreate(
            ['order_id' => $order->id],
            [
                'customer_id' => $customer->id,
                'laundry_id' => $order->laundry_id,
                'courier_id' => $order->courierJobs()->where('status', 'COMPLETED')->first()?->courier_id,
                'laundry_rating' => $request->input('laundry_rating'),
                'courier_rating' => $request->input('courier_rating'),
                'comment' => $request->input('comment'),
                'is_anonymous' => $request->boolean('is_anonymous'),
            ]
        );

        return response()->json([
            'message' => 'Ulasan dan penilaian berhasil dikirim.',
            'review' => $review,
        ], 201);
    }

    /**
     * Get public reviews for a laundry
     */
    public function laundryReviews(int $laundryId): JsonResponse
    {
        $reviews = Review::with('customer.user')
            ->where('laundry_id', $laundryId)
            ->orderByDesc('id')
            ->get();

        $avgRating = $reviews->avg('laundry_rating') ?: 5.0;

        return response()->json([
            'average_rating' => round($avgRating, 1),
            'reviews_count' => $reviews->count(),
            'reviews' => $reviews,
        ]);
    }
}
