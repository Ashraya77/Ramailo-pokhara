<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $path = $validated['file']->store('uploads/articles', 'public');

        if ($path === false) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'UPLOAD_FAILED',
                    'message' => 'Unable to store the uploaded image.',
                ],
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'url' => Storage::disk('public')->url($path),
            ],
        ], 201);
    }
}
