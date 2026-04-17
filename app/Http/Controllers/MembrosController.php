<?php

namespace App\Http\Controllers;

use App\Models\Membro;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembrosController extends Controller
{
    public function index(Request $request)
    {
        // Handle query string parameters for tab/folder/message state
        $tab = $request->query('tab', 'default');
        $folder = $request->query('folder', 'inbox');
        $message = $request->query('message', '');

        // Fetch members with pagination, filtering, and optimized columns
        $members = Membro::select('id', 'name', 'email') // Select only needed columns
            ->paginate(10); // Use pagination for performance

        // Compute additional stats via dedicated SQL queries
        $totalMembers = Membro::count();
        $activeMembers = Membro::where('status', 'active')->count();

        // Return Inertia view with members and computed stats
        return Inertia::render('Members/Index', [
            'members' => $members,
            'totalMembers' => $totalMembers,
            'activeMembers' => $activeMembers,
            'filters' => [
                'tab' => $tab,
                'folder' => $folder,
                'message' => $message,
            ],
        ]);
    }
}