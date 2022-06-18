<script lang="ts">
	import Login from './Login.svelte';
	import Logout from './Logout.svelte';
	import Hello from './Hello.svelte';
	import WAC from './WAC.svelte';

	export let name: string;
	let profile: any;
</script>

<nav class="navbar navbar-default">
	<div class="container-fluid">
	  <div class="navbar-header">
		<span class="navbar-brand">{name}</span>
	  </div>
	  <ul class="nav navbar-nav">
		<li>
			<Logout bind:profile={profile}/>
		</li>
	  </ul>
	</div>
</nav>

<Login bind:profile={profile}/>

<Hello {profile}/>
<WAC {profile}/>