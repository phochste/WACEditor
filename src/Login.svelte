<script lang="ts">
    import { onMount } from 'svelte';
    import { handleIncomingRedirect, login, onSessionRestore, getDefaultSession, onLogin, onLogout } from '@inrupt/solid-client-authn-browser';
    import { fetchUserProfile } from './util';
    import type { ProfileType } from './util';

    export let profile :ProfileType;

    let webId : string;
    let issuer : string;
    let showConnect : boolean = true;

    const onConnect = (ev) => { showConnect = false };
    const cancelConnect = (ev) => { showConnect = true };

    function handleLogin() {
        console.log(`Login to : ${issuer} redirect : ${window.location.href}`);
        login({
            oidcIssuer: issuer,
            redirectUrl: window.location.href,
            clientName: "FormViewer"
        });
    }

    onLogin( () => sessionChanged() );
    onSessionRestore( (url) => sessionChanged(url));
    onLogout( () => {
      profile = undefined;
    });

    async function sessionChanged(url?: string) {
      let session = getDefaultSession();
      webId = session.info.webId;
      profile = await fetchUserProfile(webId); 
      if (url) {
        window.history.pushState({},undefined,url);
      }
    }

    onMount( () => {
      handleIncomingRedirect({ 
          restorePreviousSession: true,
          url: window.location.href
      });
    });
</script>

{#if ! profile}
   {#if showConnect}
      <button on:click|preventDefault={onConnect}>Login</button> 
   {:else}
   <form>
      <div class="row">
        <div class="col-sm-12">
          <label for="inputsm">Solid IDP</label>
          <input
            class="form-control input-sm"
            style="max-width: 300px; align: right"
            id="inputsm"
            type="text"
            bind:value={issuer} />
          <button 
            class="btn btn-success"
            on:click|preventDefault={handleLogin}>Log In</button>
          <button 
            class="btn btn-danger"
            on:click|preventDefault={cancelConnect}>Cancel</button> 
        </div>
      </div>
   </form>
   {/if}
{/if}