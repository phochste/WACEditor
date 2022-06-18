<script lang="ts">
    import type { ProfileType } from './util';
    import { isLoggedIn } from './util';
    import { fetch } from '@inrupt/solid-client-authn-browser';
    import { getPodUrlAll } from "@inrupt/solid-client";

    export let profile : ProfileType;

</script>

{#if isLoggedIn() && profile }
    <h1>Hello {profile.givenName ? profile.givenName : "Anonymous 😉"} !</h1>

    <p>Your pods:</p>
    <!-- An example how to use the Inrupt solid-client -->
    {#await getPodUrlAll(profile.webId , {fetch: fetch})}
    <p>...waiting...</p>
    {:then urls}
        <ul>
        {#each urls as url}
            <li><p>{url}</p></li>
        {/each}
        </ul>
    {/await}
{/if}