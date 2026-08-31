<?php

use App\Http\Controllers\PublicMetadataController;
use Illuminate\Support\Facades\Route;

Route::get('/rss.xml', [PublicMetadataController::class, 'rss']);
Route::get('/sitemap.xml', [PublicMetadataController::class, 'sitemap']);
Route::get('/robots.txt', [PublicMetadataController::class, 'robots']);

Route::get('/', function () {
    return view('welcome');
});
