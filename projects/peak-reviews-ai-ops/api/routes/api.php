<?php

use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WebhookReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard/summary', DashboardController::class);

Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{review}', [ReviewController::class, 'show']);
Route::post('/reviews/{review}/analyse', [ReviewController::class, 'analyse']);
Route::post('/reviews/{review}/reply-draft', [ReviewController::class, 'replyDraft']);

Route::get('/automations', [AutomationController::class, 'index']);
Route::post('/automations/{workflow}/run', [AutomationController::class, 'run']);

Route::get('/webhooks/recent', [WebhookReviewController::class, 'recent']);
Route::post('/webhooks/reviews/{source}', [WebhookReviewController::class, 'store']);
