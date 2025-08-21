<script lang="ts">
	import '$lib/loginAssets/login.css';
	import Background from '$lib/loginAssets/Background.svelte';
	import Button from '$lib/loginAssets/Button.svelte';
	import Input from '$lib/loginAssets/Input.svelte';
	import LOGO from '$lib/assets/logo.png';
	import { m } from '$lib/paraglide/messages.js';
	import { auth } from '$lib/api/auth';
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');

	const handleLogin = async () => {
		if (!username || !password) {
			alert(m.login_fail_to_login());
			return;
		}

		const res = await auth.loginAsAdmin(username, password);
		if (res.status === 200) {
			goto('/admin/dashboard');
		}
	};
</script>

<main class="login-container">
	<Background />
	<div class="login-content">
		<img src={LOGO} alt="Logo" class="logo" />
		<div class="input-container">
			<p>{m.login_loginAdmin()}</p>
			<div>
				<h1>{m.login_adminUsername()}</h1>
				<Input
					type="text"
					bind:value={username}
					placeholder={m.login_adminUsername()}
					className=" text-white border-ku-dark-green"
				/>
			</div>
			<div>
				<h1>{m.login_adminPassword()}</h1>
				<Input
					type="password"
					bind:value={password}
					placeholder={m.login_adminPassword()}
					className=" text-white border-ku-dark-green"
				/>
			</div>
			<Button
				className="bg-ku-dark-green text-white border-ku-dark-green"
				onclick={() => {
					handleLogin();
				}}
			>
				{m.login_button()}
			</Button>
			<a href="/">
				{m.login_loginUser()}
			</a>
		</div>
	</div>
</main>
