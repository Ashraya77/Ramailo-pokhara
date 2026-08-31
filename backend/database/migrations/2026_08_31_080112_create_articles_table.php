<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->string('id', 32)->primary();

            $table->string('title');
            $table->string('slug')->unique();

            $table->text('excerpt')->nullable();
            $table->longText('content');

            $table->text('featured_image')->nullable();
            $table->string('featured_image_alt')->nullable();
            $table->text('youtube_url')->nullable();

            $table->enum('status', [
                'DRAFT',
                'PUBLISHED',
                'ARCHIVED',
            ])->default('DRAFT');

            $table->boolean('is_featured')->default(false);
            $table->boolean('is_breaking')->default(false);

            $table->timestamp('published_at', 3)->nullable();

            $table->unsignedInteger('views')->default(0);

            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->string('category_id', 32);
            $table->string('author_id', 32);

            $table->timestamps(3);

            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('author_id')
                ->references('id')
                ->on('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->index(['status', 'published_at']);
            $table->index(['category_id', 'status', 'published_at']);
            $table->index('author_id');
            $table->index(['is_featured', 'status']);
            $table->index(['is_breaking', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};