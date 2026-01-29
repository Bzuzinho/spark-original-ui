<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class ForceAppUrl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $appUrl = config('app.url');
        
        if ($appUrl) {
            URL::forceRootUrl($appUrl);
            
            // Parse the URL to set scheme
            $parsedUrl = parse_url($appUrl);
            if (isset($parsedUrl['scheme'])) {
                URL::forceScheme($parsedUrl['scheme']);
            }
        }
        
        return $next($request);
    }
}
