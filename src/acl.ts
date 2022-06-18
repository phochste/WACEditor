import { universalAccess } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser';

export type ACLType = {
    agent: string ,
    read:  boolean,
    write: boolean,
    append: boolean,
    control: boolean
};

export async function getAcl(resource: string) : Promise<ACLType[] | null> {
   return getUniversalACL(resource);
}

async function getWACACL(resource: string) : Promise<ACLType[] | null> {
    return null;
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
   catch(ex) {
      console.log(ex);
      return null;
   }

    return acls;
}

export async function setAcl(resource: string, agent: string, field : string, value: boolean) : Promise<boolean | null> {
   console.log(`set(${agent},${field},${value})`);

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