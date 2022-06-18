<script lang="ts">
   import type { ProfileType } from './util';
   import type { ACLType } from './acl';
   import { getAcl, setAcl } from './acl';

   export let profile : ProfileType;
   export let resource : string = getResource();

   let acls : ACLType[];
   let error : string;

$: if (resource && profile) {
      readACL(resource);
   }

   function getResource() {
		const queryString = window.location.search;
      console.log(`>>${window.location.search}`);
		const urlParams = new URLSearchParams(queryString);
      console.log(`>>${urlParams}`);
		const resource = urlParams.get('resource');
		console.log(`resource: ${resource}`);
		return resource;
	}

   async function readACL(url) {
      acls = await getAcl(url);

      if (acls) {
         resource = url;
         history.pushState({},undefined, location.protocol + '//' + location.host + location.pathname + '?resource=' + resource);
      }
      else {
         error = `Failed to read access rigths for ${url}`;
      }
   }

   async function writeACL(acl: ACLType, field : string, value: boolean) {
      acl[field] = value;
      await setAcl(resource,acl);
      await readACL(resource);
   }

</script>

{#if profile}

<p>
You can flip the access rights for a resource on your Pod by clicking the cells in the table below.
</p>

<hr>

<p>
<b>Step 1:</b>
The URL of the resource you want to protect: 

<input type="text" 
       on:change={(e) => readACL(e.target.value)} 
       value={resource} 
       size="80"/>
</p>

{#if resource}
<hr>

<p>
   <b>Step 2:</b> Ok, who can do what with your resource <b>{resource}</b> ?
</p>

  {#if acls}
      <table class="table">
         <thead>
            <tr>
               <th>Who</th>
               <th>Read</th>
               <th>Write</th>
               <th>Append</th>
               <th>Control</th>
            </tr>
         </thead>
         <tbody>
      {#each acls as acl}
      {#if acl['agent'] == '#public'}
         <tr>
            <td><i>Everyone</i></td>
            {#if acl['read']}
            <td on:click={() => writeACL(acl, 'read', false)}
                class="safe" title="everyone can read this">✓</td>
            {:else}
            <td on:click={() => writeACL(acl, 'read', true)}
                class="safe" title="public can't read this">𐄂</td>
            {/if}
            {#if acl['write']}
            <td on:click={() => writeACL(acl, 'write', false)}
                class="danger" title="everyone can write here!!">✓ (!)</td>
            {:else}
            <td on:click={() => writeACL(acl, 'write', true)}
                class="safe" title="public can't write here">𐄂</td>
            {/if}
            {#if acl['append']}
            <td on:click={() => writeACL(acl, 'append', false)}
                class="warning" title="everyone can append here!">✓</td>
            {:else}
            <td on:click={() => writeACL(acl, 'append', true)}
                class="safe">𐄂</td>
            {/if}
            {#if acl['controlWrite']}
            <td on:click={() => writeACL(acl, 'control', false)}
                class="fatal" title="everyone can control your pod!!!">✓ (!!)</td>
            {:else}
            <td on:click={() => writeACL(acl, 'control', true)}
                class="safe" title="public can't control this">𐄂</td>
            {/if}
         </tr>
      {:else}
         <tr>
            {#if !acl['agent'].match(/^mailto/)}
               {#if acl['agent'] == profile.webId }
               <td><i>You</i></td>
               {:else}
               <td><i>{acl['agent]']}</i></td>
               {/if}
               <td on:click={() => writeACL(acl, 'read', !acl['read'])}>{#if acl['read']}✓{:else}𐄂{/if}</td>
               <td on:click={() => writeACL(acl, 'write', !acl['write'])}>{#if acl['write']}✓{:else}𐄂{/if}</td>
               <td on:click={() => writeACL(acl, 'append', !acl['append'])}>{#if acl['append']}✓{:else}𐄂{/if}</td>
               <td on:click={() => writeACL(acl, 'control', !acl['control'])}>{#if acl['control']}✓{:else}𐄂{/if}</td>
            {/if}
         </tr>
      {/if}
      {/each}
         </tbody>
      </table>
  {:else if error}
     <p class="error">{error}</p>
  {:else}
     <p class="error">...One moment please...</p>
  {/if}
{/if}
{/if}

<style>
   .safe {
      background-color: lightgreen;
   }

   .fatal {
      background-color: crimson;
   }

   .danger {
      background-color: orangered;
   }

   .warning {
      background-color:goldenrod;
   }

</style>