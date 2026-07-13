<?php

namespace Database\Seeders;

use App\Models\AutomationRun;
use App\Models\AutomationWorkflow;
use App\Models\Business;
use App\Models\Review;
use App\Models\User;
use App\Services\Ai\ReviewAnalysisService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(['email' => 'demo@example.com'], [
            'name' => 'Demo Operator',
            'password' => Hash::make('peak-demo-password'),
        ]);

        // Container restarts rerun the seeder. Keep the curated demo dataset stable
        // while allowing newly migrated databases to be populated automatically.
        if (Business::query()->where('name', 'Northstar Dental Group')->exists()) {
            return;
        }

        $business = Business::create([
            'name' => 'Northstar Dental Group',
            'sector' => 'Multi-location healthcare',
            'website' => 'https://example.com',
            'goals' => [
                'Reduce response time on negative reviews',
                'Find recurring service themes across locations',
                'Generate safer, brand-consistent owner replies',
            ],
        ]);

        $locations = collect([
            ['name' => 'Liverpool Central', 'city' => 'Liverpool', 'postcode' => 'L1 4AA', 'average_rating' => 4.42],
            ['name' => 'Manchester Ancoats', 'city' => 'Manchester', 'postcode' => 'M4 6DE', 'average_rating' => 4.18],
            ['name' => 'Chester Clinic', 'city' => 'Chester', 'postcode' => 'CH1 2HQ', 'average_rating' => 4.65],
        ])->map(fn (array $location) => $business->locations()->create($location));

        $service = app(ReviewAnalysisService::class);

        collect([
            ['location_id' => $locations[0]->id, 'source' => 'google', 'customer_name' => 'Amelia Jones', 'customer_email' => 'amelia@example.com', 'rating' => 2, 'title' => 'Refund took too long', 'body' => 'The appointment was cancelled and the refund process took nearly three weeks. Support were polite but I had to chase by email twice.', 'status' => 'new', 'reviewed_at' => now()->subDays(1)],
            ['location_id' => $locations[0]->id, 'source' => 'facebook', 'customer_name' => 'Marcus Lee', 'rating' => 5, 'title' => 'Brilliant service', 'body' => 'Really helpful staff and clear communication before and after the appointment. Booking was simple and the team were friendly.', 'status' => 'responded', 'reviewed_at' => now()->subDays(2), 'responded_at' => now()->subDay()],
            ['location_id' => $locations[1]->id, 'source' => 'tripadvisor', 'customer_name' => 'Sofia Patel', 'rating' => 1, 'title' => 'Late and frustrating', 'body' => 'Terrible experience. The appointment started 45 minutes late and nobody explained what was happening. I would not recommend this clinic.', 'status' => 'new', 'reviewed_at' => now()->subHours(14)],
            ['location_id' => $locations[2]->id, 'source' => 'google', 'customer_name' => 'Tom Williams', 'rating' => 4, 'title' => 'Good visit', 'body' => 'The visit went well overall. The price was a little higher than expected but the staff explained the treatment clearly.', 'status' => 'responded', 'reviewed_at' => now()->subDays(4), 'responded_at' => now()->subDays(3)],
            ['location_id' => $locations[1]->id, 'source' => 'google', 'customer_name' => 'Nadia Brown', 'rating' => 3, 'title' => 'Mixed feelings', 'body' => 'The dentist was great, but follow-up support took a while and I had to call twice to get an answer.', 'status' => 'analysed', 'reviewed_at' => now()->subDays(5)],
            ['location_id' => $locations[2]->id, 'source' => 'facebook', 'customer_name' => 'Oliver Grant', 'rating' => 5, 'title' => 'Highly recommend', 'body' => 'Smooth booking, kind staff, and helpful reminders. The whole process felt professional.', 'status' => 'responded', 'reviewed_at' => now()->subDays(7), 'responded_at' => now()->subDays(6)],
        ])->each(function (array $payload) use ($service): void {
            $review = Review::create($payload);
            $review->analysis()->create($service->analyse($review));
        });

        $workflows = collect([
            [
                'name' => 'Negative Review Rescue',
                'trigger' => 'rating <= 2 or urgency = high',
                'description' => 'Escalates unhappy customers, drafts a public reply, and opens a same-day recovery task.',
                'steps' => [
                    ['name' => 'Classify review', 'detail' => 'AI scores urgency, sentiment, topic tags, and root cause.'],
                    ['name' => 'Draft owner reply', 'detail' => 'Generate a brand-safe acknowledgement for public response.'],
                    ['name' => 'Create recovery task', 'detail' => 'Assign customer care to contact the reviewer within one business day.'],
                    ['name' => 'Add insight', 'detail' => 'Feed recurring issue into the weekly location performance digest.'],
                ],
            ],
            [
                'name' => 'Review Request Follow-up',
                'trigger' => 'completed appointment + no review after 48h',
                'description' => 'Sends personalised follow-up requests after successful visits.',
                'steps' => [
                    ['name' => 'Check consent', 'detail' => 'Confirm the customer can receive review request messaging.'],
                    ['name' => 'Personalise request', 'detail' => 'Create a short message tailored to the visit type and location.'],
                    ['name' => 'Queue reminder', 'detail' => 'Schedule SMS/email through the preferred platform.'],
                ],
            ],
            [
                'name' => 'Weekly Insight Digest',
                'trigger' => 'Friday 09:00',
                'description' => 'Summarises themes by location for leadership and operations.',
                'steps' => [
                    ['name' => 'Aggregate topics', 'detail' => 'Group review tags, ratings, response SLA, and unresolved issues.'],
                    ['name' => 'Write digest', 'detail' => 'Generate concise operational insights and recommended actions.'],
                    ['name' => 'Notify team', 'detail' => 'Post summary to email, Slack, or CRM notes.'],
                ],
            ],
        ])->map(fn (array $workflow) => AutomationWorkflow::create($workflow + ['enabled' => true]));

        AutomationRun::create([
            'automation_workflow_id' => $workflows[0]->id,
            'review_id' => Review::query()->where('rating', '<=', 2)->first()->id,
            'status' => 'completed',
            'payload' => ['triggered_by' => 'seed', 'priority' => 'high'],
            'events' => $workflows[0]->steps,
            'ran_at' => now()->subHours(3),
        ]);
    }
}
