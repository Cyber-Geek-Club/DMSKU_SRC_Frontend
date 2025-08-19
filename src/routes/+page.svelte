<script lang="ts">
	import '$lib/loginAssets/login.css';
	import Background from '$lib/loginAssets/Background.svelte';
	import LOGO from '$lib/assets/logo.png';
	import Button from '$lib/loginAssets/Button.svelte';
	import GoogleIcon from '$lib/loginAssets/GoogleIcon.svelte';
	import { m } from '$lib/paraglide/messages.js';
</script>

<main class="login-container">
	<Background />
	<div class="login-content">
		<img src={LOGO} alt="Logo" class="logo" />
		<div class="button-container">
			<Button className="bg-ku-dark-green text-white border-ku-dark-green">
				{m.login_button_checkStatus()}
			</Button>
			<Button className="flex flex-row justify-center items-center gap-2">
				<GoogleIcon size="40" />
				{m.login_button_login()}
			</Button>
			<a href="/admin/login_form">
				{m.login_loginAdmin()}
			</a>
		</div>
	</div>
</main>
