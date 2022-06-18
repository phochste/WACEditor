<script lang="ts">
    import { handleIncomingRedirect, login } from '@inrupt/solid-client-authn-browser';
    import { fetchUserProfile } from './util';
    import type { ProfileType } from './util';

    export let profile :ProfileType;

    let webId : string;
    let issuer : string;
    let showConnect : boolean = true;

    const onConnect = (ev) => { showConnect = false };
    const cancelConnect = (ev) => { showConnect = true };

    handleIncomingRedirect({ restorePreviousSession: true })
        .then( async info => {
        webId = info.webId;
        profile = await fetchUserProfile(webId);
    });

    function handleLogin() {
        console.log(`Login to : ${issuer} redirect : ${window.location.href}`);
        login({
            oidcIssuer: issuer,
            redirectUrl: window.location.href,
            clientName: "FormViewer"
        });
    }
</script>

{#if ! profile}
   {#if showConnect}
      <button on:click|preventDefault={onConnect}>Login</button> 
      <p>
        You need to login in your Pod to use this application.
      </p>
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