<script lang="ts">
    import type { ProfileType } from './util';
    import { isLoggedIn } from './util';
    import { fetch } from '@inrupt/solid-client-authn-browser';
    import { getPodUrlAll } from "@inrupt/solid-client";

    export let profile : ProfileType;

</script>

{#if isLoggedIn() && profile }
    <h1>Hello {profile.givenName ? profile.givenName : "Anonymous 😉"} !</h1>
{/if}