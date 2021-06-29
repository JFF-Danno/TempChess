import React, { useEffect, useState } from "react";
import { ethers } from 'ethers'
import ManageCommons_Main from './admin/ManageCommons_Main'

import ManageCommons_Withdraw from './admin/ManageCommons_Withdraw'

import ManageCommons_Creator from './admin/ManageCommons_Creator'

import ManageCommons_Fee from './admin/ManageCommons_Fee'
import moralis from "moralis";
import SignIn from './SignIn'
import {BrandButton} from 'pivotal-ui/react/buttons';
import {FlexCol} from 'pivotal-ui/react/flex-grids';
import {Panel} from 'pivotal-ui/react/panels';

const ManageCommons = () => {
  // ----- Smart Contract Config

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

    const initialUser = moralis.User.current();
    const [user,        setUser         ] = useState(initialUser);
    const [isCreator,   setIsCreator    ] = useState(false)
    const [isAdmin,     setIsAdmin      ] = useState(false)
    const [gamma,       setGamma        ] = useState(null)
    const [commons,     setCommons      ] = useState(null)
    const [address,     setAddress]     = useState('')
    const [commonsName, setCommonsName] = useState('')
    const Commons = moralis.Object.extend( "Commons", {}, {});

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()


    function getCommonsAddress()
    {
        const  address = process.env.REACT_APP_COMMONS_CONTRACT;
        setCommons(address);
        return address;
    }
        const getCommons = async () =>
        {
            var commonsId =    window.location.search.substring( 11 );
            const query = new moralis.Query( Commons );
            query.equalTo( "objectId", commonsId );
            const results = await query.find();
            if ( results.length > 0 ) // TODO 
            { 
                const object = results[0];
                setGamma( object.get('gammaAddress') )
                setCommonsName( object.get('name') );
                setCommons( object.get('contractAddress')  );
              //  await isOwner()
             //   await isWhitelisted()
            }
            else
            {
                alert( 'Commons not found!' );  //TODO handle this properly
            }
        }



        const callbackFunction = (user,address) => {  setUser(user); setAddress(address); }

 useEffect(() => {

      getCommonsAddress(); 

  })


  return (

    
    <div className="App">
        <Panel {...{title: commonsName, titleCols: [<FlexCol fixed><BrandButton href="/" >Home</BrandButton><SignIn callBack={callbackFunction}/></FlexCol>], style: {  padding: '8px', background: '#f2f2f2'}}}>
{ commons && (<div>
      <ManageCommons_Main provider={provider} commons={commons}/>
      <ManageCommons_Withdraw signer={signer} commons={commons} /> 
     

      <ManageCommons_Creator signer={signer} commons={commons} gamma={gamma} />
      <ManageCommons_Fee signer={signer} commons={commons} gamma={gamma} />

                      
</div>
        )}
    </Panel>
    </div>
  )
}

export default ManageCommons
