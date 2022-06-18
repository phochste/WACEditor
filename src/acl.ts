import { 
   universalAccess ,  
   getSolidDatasetWithAcl,
   getPublicAccess,
   getAgentAccessAll,
   hasResourceAcl,
   hasFallbackAcl,
   hasAccessibleAcl,
   createAclFromFallbackAcl,
   getResourceAcl,
   saveAclFor,
   setAgentResourceAccess,
   setPublicResourceAccess
   } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser';

export type ACLType = {
    agent: string ,
    default: boolean,
    read:  boolean,
    write: boolean,
    append: boolean,
    control: boolean
};

export async function getAcl(resource: string) : Promise<ACLType[] | null> {
   //return getUniversalACL(resource);
   return getWACACL(resource);
}

async function getWACACL(resource: string) : Promise<ACLType[] | null> {
   console.log(`getWACACL(${resource})`);

   const acls : ACLType[] = [];

   try {
      const myDatasetWithAcl = await getSolidDatasetWithAcl(resource, {
         fetch: fetch
      });

      const publicAccess = getPublicAccess(myDatasetWithAcl);

      acls.push( {
         agent: '#public' ,
         read: publicAccess['read'] ,
         write: publicAccess['write'] ,
         append: publicAccess['append'] ,
         control: publicAccess['control']
      } as ACLType);

      const accessByAgent = getAgentAccessAll(myDatasetWithAcl);

      console.log(accessByAgent);

      for (const agent in accessByAgent) {
         acls.push( {
            agent: agent ,
            read: accessByAgent[agent]['read'] ,
            write: accessByAgent[agent]['write'] ,
            append: accessByAgent[agent]['append'] ,
            control: accessByAgent[agent]['control']
         } as ACLType);
      }
   }
   catch (e) {
      console.log(`WAC Error ${e}`);
      return null;
   }

   return acls;
}

async function getUniversalACL(resource:string) : Promise<ACLType[] | null> {
   console.log(`getUniversalACL(${resource})`);

   const acls : ACLType[] = [];

   try {
         const aclPublic = await universalAccess.getPublicAccess(resource, {
            fetch: fetch
         });

        acls.push({ 
            agent: '#public' ,
            read: aclPublic['read'],
            write: aclPublic['write'],
            append: aclPublic['append'],
            control: aclPublic['controlRead'] || aclPublic['controlWrite'] 
        } as ACLType);
        
        const aclAgent = await universalAccess.getAgentAccessAll(resource, {
            fetch: fetch
        });

        for (const [agent,acl] of Object.entries(aclAgent)) {
            acls.push({
               agent: agent ,
               read: acl['read'],
               write: acl['write'],
               append: acl['append'],
               control: acl['controlRead'] || aclAgent['controlWrite']
            } as ACLType);
        }
   }
   catch(e) {
      console.log(`Universal error ${e}`);
      return null;
   }

    return acls;
}

export async function setAcl(resource: string, acl : ACLType) : Promise<boolean | null> {
   //return setUniversalACL(resource,acl);
   return setWACACL(resource,acl);
}

export async function setWACACL(resource: string, acl: ACLType) : Promise<boolean | null> {
   console.log(`setWACACL(${resource},${acl}`);

   let result : boolean;

   try {
      // Fetch the SolidDataset and its associated ACLs, if available:
      const myDatasetWithAcl = await getSolidDatasetWithAcl(resource, {
         fetch: fetch
      });

      let resourceAcl;
      if (!hasResourceAcl(myDatasetWithAcl)) {
         if (!hasAccessibleAcl(myDatasetWithAcl)) {
            console.log("The current user does not have permission to change access rights to this Resource.");
            return false;
         }
         if (!hasFallbackAcl(myDatasetWithAcl)) {
            console.log( "The current user does not have permission to see who currently has access to this Resource.");
            return false;
         }
         resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);
      }
      else {
         resourceAcl = getResourceAcl(myDatasetWithAcl);
      }

      const aclUpdate = {
         read: acl['read'] ,
         write: acl['write'] ,
         append: acl['append'] ,
         control: acl['control'] 
      };

      let updatedAcl;

      if (acl['agent'] == '#public') {
         updatedAcl = setPublicResourceAccess(resourceAcl,aclUpdate);
      }
      else {
         updatedAcl = setAgentResourceAccess(resourceAcl, acl['agent'] ,aclUpdate);
      }

      result = await saveAclFor(myDatasetWithAcl, updatedAcl, {
         fetch: fetch
      }) ? true : false;
   }
   catch (e) {
      console.log(`WAC error ${e}`);
      return null;
   }

   return result;
}

export async function setUniversalACL(resource: string, acl: ACLType) : Promise<boolean | null> {
   console.log(`setUniversalACL(${resource},${acl}`);

   let result : any;
   try {
      const aclUpdate = {
         read: acl['read'] ,
         write: acl['write'] ,
         append: acl['append'] ,
         controlRead: acl['control'] ,
         controlWrite: acl['control']
      };

      if ( acl['agent'] == '#public' ) { 
         result = await universalAccess.setPublicAccess(resource, aclUpdate, {fetch : fetch})
      }
      else {
         result = await universalAccess.setAgentAccess(resource, acl['agent'], aclUpdate, {fetch : fetch})
      }
    }  
    catch(e) {
       console.log(e);
       return null;
    }

    return result ? true : false;
}