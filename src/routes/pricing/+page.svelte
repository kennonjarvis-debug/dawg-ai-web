<script lang="ts">
/**
 * Pricing Page - DAWG AI
 * Freemium model with clear upgrade path
 */

import { Button, Icon } from '$lib/design-system';
import { goto } from '$app/navigation';

const tiers = [
	{
		name: 'Free',
		price: '$0',
		period: 'forever',
		description: 'Perfect for getting started',
		features: [
			{ text: '2 Projects', included: true },
			{ text: '8 Tracks per project', included: true },
			{ text: 'Basic effects & instruments', included: true },
			{ text: 'Export to WAV/MP3', included: true },
			{ text: 'Community support', included: true },
			{ text: 'Cloud storage: 500MB', included: true },
			{ text: 'Advanced AI features', included: false },
			{ text: 'Collaboration', included: false },
			{ text: 'Priority support', included: false }
		],
		cta: 'Get Started Free',
		variant: 'secondary' as const,
		popular: false
	},
	{
		name: 'Pro',
		price: '$12',
		period: 'per month',
		description: 'For serious producers',
		features: [
			{ text: 'Unlimited Projects', included: true },
			{ text: 'Unlimited Tracks', included: true },
			{ text: 'All effects & instruments', included: true },
			{ text: 'Export to all formats', included: true },
			{ text: 'Priority support', included: true },
			{ text: 'Cloud storage: 20GB', included: true },
			{ text: 'AI-powered mastering', included: true },
			{ text: 'Real-time collaboration', included: true },
			{ text: 'VST plugin support', included: true },
			{ text: 'Stem separation', included: true }
		],
		cta: 'Start Free Trial',
		variant: 'primary' as const,
		popular: true
	},
	{
		name: 'Studio',
		price: '$49',
		period: 'per month',
		description: 'For professional studios',
		features: [
			{ text: 'Everything in Pro, plus:', included: true },
			{ text: 'Team workspace (5 users)', included: true },
			{ text: 'Cloud storage: 100GB', included: true },
			{ text: 'Advanced analytics', included: true },
			{ text: 'Custom branding', included: true },
			{ text: 'API access', included: true },
			{ text: 'Dedicated account manager', included: true },
			{ text: 'On-premise deployment option', included: true },
			{ text: 'SLA guarantee', included: true }
		],
		cta: 'Contact Sales',
		variant: 'secondary' as const,
		popular: false
	}
];

function handleSelectPlan(tierName: string) {
	if (tierName === 'Free') {
		goto('/');
	} else if (tierName === 'Studio') {
		// Open contact form or email
		window.location.href = 'mailto:sales@dawg-ai.com?subject=Studio%20Plan%20Inquiry';
	} else {
		// Pro plan
		goto('/');
	}
}
</script>

<svelte:head>
	<title>Pricing - DAWG AI</title>
	<meta name="description" content="Choose the perfect plan for your music production needs. Start free, upgrade when you're ready." />
</svelte:head>

<div class="min-h-screen p-8">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-16">
			<h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
				Simple, Transparent Pricing
			</h1>
			<p class="text-xl text-white/70 mb-2">
				Start free. Upgrade when you're ready.
			</p>
			<p class="text-white/50">
				No credit card required. Cancel anytime.
			</p>
		</div>

		<!-- Pricing Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
			{#each tiers as tier}
				<div class="relative">
					<!-- Popular Badge -->
					{#if tier.popular}
						<div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
							<div class="glass-purple px-4 py-1 rounded-full text-sm font-bold">
								Most Popular
							</div>
						</div>
					{/if}

					<!-- Card -->
					<div class="glass-strong rounded-panel p-8 h-full flex flex-col {tier.popular ? 'border-2 border-accent-primary' : ''}">
						<!-- Tier Name -->
						<h2 class="text-2xl font-bold mb-2">{tier.name}</h2>

						<!-- Description -->
						<p class="text-white/60 mb-6">{tier.description}</p>

						<!-- Price -->
						<div class="mb-6">
							<div class="flex items-baseline gap-2">
								<span class="text-5xl font-bold">{tier.price}</span>
								<span class="text-white/60">/ {tier.period}</span>
							</div>
						</div>

						<!-- Features -->
						<ul class="space-y-3 mb-8 flex-grow">
							{#each tier.features as feature}
								<li class="flex items-start gap-3">
									{#if feature.included}
										<div class="mt-1">
											<Icon name="check" size="sm" class="text-accent-primary" />
										</div>
										<span class="text-white/80">{feature.text}</span>
									{:else}
										<div class="mt-1">
											<Icon name="x" size="sm" class="text-white/30" />
										</div>
										<span class="text-white/40 line-through">{feature.text}</span>
									{/if}
								</li>
							{/each}
						</ul>

						<!-- CTA Button -->
						<Button
							variant={tier.variant}
							size="lg"
							fullWidth
							onclick={() => handleSelectPlan(tier.name)}
						>
							{tier.cta}
						</Button>
					</div>
				</div>
			{/each}
		</div>

		<!-- FAQ Section -->
		<div class="glass-strong rounded-panel p-12">
			<h2 class="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<h3 class="text-xl font-bold mb-2">Can I switch plans later?</h3>
					<p class="text-white/70">
						Yes! You can upgrade or downgrade at any time. Changes take effect immediately.
					</p>
				</div>

				<div>
					<h3 class="text-xl font-bold mb-2">What payment methods do you accept?</h3>
					<p class="text-white/70">
						We accept all major credit cards, PayPal, and bank transfers for Studio plans.
					</p>
				</div>

				<div>
					<h3 class="text-xl font-bold mb-2">Is there a free trial?</h3>
					<p class="text-white/70">
						Yes! Pro plans include a 14-day free trial. No credit card required to start.
					</p>
				</div>

				<div>
					<h3 class="text-xl font-bold mb-2">What happens to my projects if I downgrade?</h3>
					<p class="text-white/70">
						All your projects are preserved. You'll just be limited to the tier's project count until you upgrade again.
					</p>
				</div>

				<div>
					<h3 class="text-xl font-bold mb-2">Do you offer educational discounts?</h3>
					<p class="text-white/70">
						Yes! Students and educators get 50% off Pro plans. Contact us with your .edu email.
					</p>
				</div>

				<div>
					<h3 class="text-xl font-bold mb-2">Can I cancel anytime?</h3>
					<p class="text-white/70">
						Absolutely. No lock-in contracts. Cancel anytime and keep access until the end of your billing period.
					</p>
				</div>
			</div>
		</div>

		<!-- Bottom CTA -->
		<div class="text-center mt-16">
			<h2 class="text-3xl font-bold mb-4">Ready to create?</h2>
			<p class="text-white/70 mb-8">
				Join thousands of producers making music on DAWG AI
			</p>
			<div class="flex gap-4 justify-center">
				<Button variant="primary" size="xl" onclick={() => goto('/')}>
					<Icon name="play" size="md" />
					<span class="ml-2">Start Creating</span>
				</Button>
				<Button variant="secondary" size="xl" onclick={() => goto('/daw')}>
					<Icon name="music" size="md" />
					<span class="ml-2">Try the DAW</span>
				</Button>
			</div>
		</div>
	</div>
</div>
