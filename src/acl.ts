import { 
   universalAccess ,  
   getSolidDatasetWithAcl,
   getPublicAccess,
   getAgentAccessAll} from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser';

export type ACLType = {
    agent: string ,
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

export async function setAcl(resource: string, agent: string, field : string, value: boolean) : Promise<boolean | null> {
   console.log(`set(${resource},${agent},${field},${value})`);

   let result : any;
   try {
      if ( agent == '#public' ) { // Public
         if (field == 'read') {
            result = await universalAccess.setPublicAccess(resource, {read : value}, {fetch : fetch})
         }
         else if (field == 'write') {
            result = await universalAccess.setPublicAccess(resource, {write : value}, {fetch : fetch})
         }
         else if (field == 'append') {
            result = await universalAccess.setPublicAccess(resource, {append : value}, {fetch : fetch})
         }
         else if (field == 'control') {
            result = await universalAccess.setPublicAccess(resource, {
                  controlRead : value ,
                  controlWrite : value 
            }, {fetch : fetch})
         }
      }
      else {
         if (field == 'read') {
            result = await universalAccess.setAgentAccess(resource, agent, {read : value}, {fetch : fetch})
         }
         else if (field == 'write') {
            result = await universalAccess.setAgentAccess(resource, agent, {write : value}, {fetch : fetch})
         }
         else if (field == 'append') {
            result = await universalAccess.setAgentAccess(resource, agent, {append : value}, {fetch : fetch})
         }
         else if (field == 'control') {
            result = await universalAccess.setAgentAccess(resource, agent, {
                  controlRead : value ,
                  controlWrite : value 
            }, {fetch : fetch})
         }
      }
    }  
    catch(e) {
       console.log(e);
       return null;
    }

    return result ? true : false;
}