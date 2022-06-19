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

      resource = url;
      
      if (acls) {
         history.pushState({},undefined, location.protocol + '//' + location.host + location.pathname + '?resource=' + resource);
      }
      else {
         error = `Failed to read access rigths for ${url}`;
      }
   }

   function parseForm(formData) {
      const data = {
         id: undefined ,
         read: false,
         write: false,
         append: false,
         control: false
      };

      for (let field of formData) {
         const [key, value] = field;
         if (key == 'id') {
            data['id'] = value;
         }
         else if (key == 'rights') {
            data[value] = true;
         }
      }
      return data;
   }

   function onAgentAcl(e) {
      const data = parseForm(new FormData(e.target));

      if (data['id'] && data['id'].match(/^http(s)?:\/\//)) {
         writeACL({
            agent: '#agent',
            ...data
         } as ACLType, undefined, undefined);
         
         e.target.reset();
      }
      else {
         alert(`${data['id']} doesn't like as a valid person. Need a URL`);
      }
   }

   function onGroupAcl(e) {
      const data = parseForm(new FormData(e.target));

      if (data['id'] && data['id'].match(/^http(s)?:\/\//)) {
         writeACL({
            agent: '#group',
            ...data
         } as ACLType, undefined, undefined);

         e.target.reset();
      }
      else {
         alert(`${data['id']} doesn't like as a valid group. Need a URL`);
      }
   }

   async function writeACL(acl: ACLType, field : string, value: boolean) {
      if (field) {
      acl[field] = value;
      }
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
<button on:click={ () => readACL(resource)} size="30">
<img src="images/reload.png" 
     alt="Reload" 
     title="Reload"
     width="20"
     height="20"
     >
</button>
</p>

{#if resource}
<hr>

<p>
   <b>Step 2:</b> Ok, change access/edit/control for resource <b>{resource}</b> ?
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
                class="safe" title="public can't append here">𐄂</td>
            {/if}
            {#if acl['control']}
            <td on:click={() => writeACL(acl, 'control', false)}
                class="fatal" title="everyone can control your pod!!!">✓ (!!)</td>
            {:else}
            <td on:click={() => writeACL(acl, 'control', true)}
                class="safe" title="public can't control this">𐄂</td>
            {/if}
         </tr>
      {:else if acl['agent'] == '#group'}
         <tr>
            <td><i>Group</i> {acl['id']}</td>
            {#if acl['read']}
            <td on:click={() => writeACL(acl, 'read', false)}
                class="safe" title="group can read this">✓</td>
            {:else}
            <td on:click={() => writeACL(acl, 'read', true)}
                class="safe" title="group can't read this">𐄂</td>
            {/if}
            {#if acl['write']}
            <td on:click={() => writeACL(acl, 'write', false)}
                class="danger" title="group can write here!!">✓ (!)</td>
            {:else}
            <td on:click={() => writeACL(acl, 'write', true)}
                class="safe" title="group can't write here">𐄂</td>
            {/if}
            {#if acl['append']}
            <td on:click={() => writeACL(acl, 'append', false)}
                class="warning" title="group can append here!">✓</td>
            {:else}
            <td on:click={() => writeACL(acl, 'append', true)}
                class="safe" title="group can't append here">𐄂</td>
            {/if}
            {#if acl['control']}
            <td on:click={() => writeACL(acl, 'control', false)}
                class="fatal" title="group can control your pod!!!">✓ (!!)</td>
            {:else}
            <td on:click={() => writeACL(acl, 'control', true)}
                class="safe" title="group can't control this">𐄂</td>
            {/if}
         </tr>
      {:else}
         <tr>
            {#if !acl['id'].match(/^mailto/)}
               {#if acl['id'] == profile.webId }
               <td><i>You</i></td>
               {:else}
               <td><i>Agent</i> {acl['id']}</td>
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

<hr>

<p><b>Step 3:</b> You need more access rights?</p>

<p><b>Add access rights for a person</b></p>
<form id="agentACL" on:submit|preventDefault={onAgentAcl}>
   Webid: <input type="text" name="id" size="80">
   Read: <input type="checkbox" name="rights" value="read">
   Write: <input type="checkbox" name="rights" value="write"> 
   Append: <input type="checkbox" name="rights" value="append"> 
   Control: <input type="checkbox" name="rights" value="control"> 
   <button type="submit">Add</button>
</form>

<br>

<p><b>Add access rights for a group</b></p>
<form id="groupACL" on:submit|preventDefault={onGroupAcl}>
   Group: <input type="text" name="id" size="80">
   Read: <input type="checkbox" name="rights" value="read">
   Write: <input type="checkbox" name="rights" value="write"> 
   Append: <input type="checkbox" name="rights" value="append"> 
   Control: <input type="checkbox" name="rights" value="control"> 
   <button type="submit">Add</button>
</form>

<hr>
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