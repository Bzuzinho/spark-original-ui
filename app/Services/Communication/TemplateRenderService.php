<?php

namespace App\Services\Communication;

use App\Models\CommunicationCampaignChannel;

class TemplateRenderService
{
    public function renderChannelContent(CommunicationCampaignChannel $channel, array $variables = []): array
    {
        $subject = $channel->subject;
        $body = $channel->message_body;

        if ($channel->template) {
            $subject = $channel->template->subject ?? $subject;
            $body = $channel->template->body;
        }

        return [
            'subject' => $this->renderText($subject, $variables),
            'body' => $this->renderText($body, $variables),
        ];
    }

    public function renderText(?string $text, array $variables = []): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        $rendered = $text;

        foreach ($variables as $key => $value) {
            $rendered = str_replace('{{' . $key . '}}', (string) $value, $rendered);
        }

        return $rendered;
    }
}
