<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalMembers' => User::count(),
                'activeAthletes' => 0, // TODO: filtrar por tipo quando campo existir
                'guardians' => 0, // TODO: filtrar por tipo quando campo existir
                'upcomingEvents' => 0, // TODO: quando tabela events existir
                'monthlyRevenue' => 0.00, // TODO: quando tabela transactions existir
                'totalUserTypes' => UserType::count(),
                'totalAgeGroups' => AgeGroup::count(),
            ],
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }
}