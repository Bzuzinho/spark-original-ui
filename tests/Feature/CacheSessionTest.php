<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheSessionTest extends TestCase
{
    public function test_cache_can_store_and_retrieve_values(): void
    {
        Cache::put('test_key', 'test_value', 60);
        
        $this->assertEquals('test_value', Cache::get('test_key'));
    }

    public function test_redis_connection_works_if_configured(): void
    {
        if (config('cache.default') === 'redis') {
            $redis = Redis::connection();
            $redis->set('test_redis', 'works');
            
            $this->assertEquals('works', $redis->get('test_redis'));
            
            $redis->del('test_redis');
        } else {
            $this->markTestSkipped('Redis not configured');
        }
    }

    public function test_session_persists_across_requests(): void
    {
        $response = $this->withSession(['user_id' => 1])
            ->get('/');
            
        $response->assertSessionHas('user_id', 1);
    }
}
