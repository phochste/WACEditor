import { 
   getSolidDatasetWithAcl,
   getResourceInfoWithAcl,
   getPublicAccess,
   getPublicDefaultAccess,
   getGroupAccessAll,
   getGroupDefaultAccessAll,
   getAgentAccessAll,
   getAgentDefaultAccessAll,
   hasResourceAcl,
   hasFallbackAcl,
   hasAccessibleAcl,
   createAclFromFallbackAcl,
   getResourceAcl,
   saveAclFor,
   setPublicResourceAccess,
   setPublicDefaultAccess,
   setGroupResourceAccess,
   setGroupDefaultAccess,
   setAgentResourceAccess,
   setAgentDefaultAccess,
   createAcl,
   type WithAccessibleAcl
   } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser';

export type ACLType = {
    agent: string ,
    id: string,
    default: boolean,
    read:  boolean,
    write: boolean,
    append: boolean,
    control: boolean
};

export async function getAcl(resource: string) : Promise<ACLType[] | null> {
   return getWACACL(resource);
}

async function getWACACL(resource: string) : Promise<ACLType[] | null> {
   console.log(`getWACACL(${resource})`);

   const acls : ACLType[] = [];

   try {
      const resourceInfo = await getResourceInfoWithAcl(resource, {
         fetch: fetch
      });

      const publicAccess = getPublicAccess(resourceInfo);

      acls.push( {
         agent: '#public' ,
         id: undefined,
         default: false,
         read: publicAccess['read'] ,
         write: publicAccess['write'] ,
         append: publicAccess['append'] ,
         control: publicAccess['control']
      } as ACLType);

      let resourceAcl = getResourceAcl(resourceInfo);

      if (! resourceAcl) {
         console.log(`${resource} has no ACL`);
         if (hasFallbackAcl(resourceInfo) && hasAccessibleAcl(resourceInfo)) {
            console.info('found fallback ACL');
            resourceAcl = createAclFromFallbackAcl(resourceInfo);
         }
         else if (hasAccessibleAcl(resourceInfo)) {
            console.log('create new ACL');
            resourceAcl = createAcl(resourceInfo);
         }
         else {
            console.error('no ACL found in the root');
            throw new Error('No acl found in the root');
         }
      }

      if (resourceAcl) {
         const publicDefaultAccess  = getPublicDefaultAccess(resourceAcl);

         acls.push( {
            agent: '#public' ,
            id: undefined,
            default: true,
            read: publicDefaultAccess['read'] ,
            write: publicDefaultAccess['write'] ,
            append: publicDefaultAccess['append'] ,
            control: publicDefaultAccess['control'] 
         } as ACLType);
      }

      const groupAccess = getGroupAccessAll(resourceInfo);

      for (const agent in groupAccess) {
         acls.push( {
            agent: '#group' ,
            id: agent,
            default: false,
            read: groupAccess[agent]['read'] ,
            write: groupAccess[agent]['write'] ,
            append: groupAccess[agent]['append'] ,
            control: groupAccess[agent]['control']
         } as ACLType);
      }

      if (resourceAcl) {
         const groupDefaultAccess = getGroupDefaultAccessAll(resourceAcl);

         for (const agent in groupDefaultAccess) {
            acls.push( {
               agent: '#group' ,
               id: agent,
               default: true,
               read: groupDefaultAccess[agent]['read'] ,
               write: groupDefaultAccess[agent]['write'] ,
               append: groupDefaultAccess[agent]['append'] ,
               control: groupDefaultAccess[agent]['control']
            } as ACLType);
         }
      }

      const agentAccess = getAgentAccessAll(resourceInfo);

      for (const agent in agentAccess) {
         acls.push( {
            agent: '#agent' ,
            id: agent,
            default: false,
            read: agentAccess[agent]['read'] ,
            write: agentAccess[agent]['write'] ,
            append: agentAccess[agent]['append'] ,
            control: agentAccess[agent]['control']
         } as ACLType);
      }

      if (resourceAcl) {
         const agentDefaultAccess = getAgentDefaultAccessAll(resourceAcl);

         for (const agent in agentDefaultAccess) {
            acls.push( {
               agent: '#agent' ,
               id: agent,
               default: true,
               read: agentDefaultAccess[agent]['read'] ,
               write: agentDefaultAccess[agent]['write'] ,
               append: agentDefaultAccess[agent]['append'] ,
               control: agentDefaultAccess[agent]['control']
            } as ACLType);
         }
      }
   }
   catch (e) {
      console.log(`WAC Error ${e}`);
      return null;
   }

   console.log(acls);

   return acls;
}

export async function setAcl(resource: string, acl : ACLType) : Promise<boolean | null> {
   return setWACACL(resource,acl);
}

export async function setWACACL(resource: string, acl: ACLType) : Promise<boolean | null> {
   console.log(`setWACACL(${resource}}`);
   console.log(acl);

   let result : boolean = false;

   try {
      let myDatasetWithAcl = await getResourceInfoWithAcl(resource, {
         fetch: fetch
      });

      let resourceAcl;

      if (hasResourceAcl(myDatasetWithAcl)) {
         console.info('found resource ACL');
         resourceAcl = getResourceAcl(myDatasetWithAcl);
      }
      else {
         try {
            if (hasFallbackAcl(myDatasetWithAcl) && hasAccessibleAcl(myDatasetWithAcl)) {
               console.info('found fallback ACL');
               resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);
            }
            else if (hasAccessibleAcl(myDatasetWithAcl)) {
               console.log('create new ACL');
               resourceAcl = createAcl(myDatasetWithAcl);
            }
            else {
               console.error('no ACL found in the root');
               throw new Error('No acl found in the root');
            }
         }
         catch (e) {
            console.error('failed to initialize ACL');
            throw new Error('No way found to initialize the ACL');
         }
      }

      if (! resourceAcl) {
         console.error('You have no permission to edit ${resource} ACL');
         return null;
      }

      const aclUpdate = {
         read: acl['read'] ,
         write: acl['write'] ,
         append: acl['append'] ,
         control: acl['control'] 
      };

      let updatedAcl;

      if (acl['agent'] == '#public') {
         if (acl['default']) {
            updatedAcl = setPublicDefaultAccess(resourceAcl,aclUpdate);
         }
         else {
            updatedAcl = setPublicResourceAccess(resourceAcl,aclUpdate);
         }
      }
      else if (acl['agent'] == '#group') {
         if (acl['default']) {
            updatedAcl = setGroupDefaultAccess(resourceAcl, acl['id'],aclUpdate);
         }
         else {
            updatedAcl = setGroupResourceAccess(resourceAcl, acl['id'],aclUpdate);
         } 
      }
      else if (acl['agent'] == '#agent') {
         if (acl['default']) {
            updatedAcl = setAgentDefaultAccess(resourceAcl, acl['id'],aclUpdate);
         }
         else {
            updatedAcl = setAgentResourceAccess(resourceAcl, acl['id'],aclUpdate);
         }
      }
      else {
         console.error(`unknown agent ${acl['agent']}`);
         return null;
      }

      if (updatedAcl && hasAccessibleAcl(myDatasetWithAcl)) {
         result = await saveAclFor(myDatasetWithAcl as WithAccessibleAcl, updatedAcl, {
            fetch: fetch
         }) ? true : false;
      }
   }
   catch (e) {
      console.error(`WAC error ${e}`);
      return null;
   }

   return result;
}