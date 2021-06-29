import React, { useState } from "react";
import {Modal} from 'pivotal-ui/react/modal';
import {Input} from 'pivotal-ui/react/inputs';
import {DefaultButton} from 'pivotal-ui/react/buttons';
import { ethers } from 'ethers'


import Web3 from 'web3';
import { PrimaryButton, DangerButton, BrandButton} from 'pivotal-ui/react/buttons';
import moralis from "moralis";

const AddMinterModal = (props) => {

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        var web3 = new Web3(Web3.givenProvider);

        const UserAddress = moralis.Object.extend( "UserAddress", {}, {
            newUserAddress: function(address) { 
                const userAddress = new UserAddress();
                userAddress.set( "account",     user.get("ethAddress").toLowerCase()  );
                userAddress.set( "address",     address.toLowerCase()  );
                return userAddress; 
                }
        } );
        const user = moralis.User.current();

        const [minterAddress,               setMinterAddress        ] = useState('')
        const [show,                        setShow                 ] = useState(false)
        const [addressBook,                 setAddressBook          ] = useState([])
 
    
    const addMinter = async () => {
        props.callBack( minterAddress );
       
        const query = new moralis.Query( UserAddress);
        query.equalTo( "account", user.get("ethAddress") );
        const results = await query.find();
        var found = false;             
        for ( var i = 0; i < results.length; i++ ) // TODO 
        {
            if ( results[i].get('address') === minterAddress )
            {
                found = true;
            }
        } 
        if ( ! found )
        {
            const ua = UserAddress.newUserAddress(minterAddress);
            
            await ua.save();
        }
        setMinterAddress('');
        document.getElementById('org').value='';
    
       
    }

    const setAddress = (address) => {
        document.getElementById('abook').value={address};    
    }

    const getAddresses = async () => {

//        alert(user.get("ethAddress"));
       var addresses = [];
       
       const query = new moralis.Query( UserAddress);
       query.equalTo( "account", user.get("ethAddress") );
       const results = await query.find();
                     
       for ( var i = 0; i < results.length; i++ ) // TODO 
       { 
             addresses.push( results[i].get("address") ); 
       }
       if ( results.length === 0  )
       {
           addresses.push( user.get("ethAddress") );
       };

       const rows = addresses.map((account,index) => <li className="addressitem txt-m" key={index}>
                                                        <div>
                                                            <button onClick={()=>{ document.getElementById('org').value=account; setMinterAddress( account );}}>{account}</button>
                                                        </div>
                                                      </li>  );
       setAddressBook( rows );
       
    }

    return (
      <div>
      <DefaultButton onClick={() => {setShow(true);getAddresses();}}>Add Minter</DefaultButton>
        <Modal 
                title="Add Another Minter"
                size="30%"
                show={show}
                onHide={() => setShow(false)}                >
         <div>
         
          <input
            type='text'
            placeholder='Enter address'
            onChange={(e) => { setMinterAddress(e.target.value); document.getElementById( 'addminterbutton' ).disabled=false;  } }
            id='org'
          />

            <div id="abook">
               <img id="abookimg" src='./address-book.png' /><br/>
                <ul>
                    {addressBook}
                </ul>
            </div>
        </div>
<br/>
<DefaultButton id='addminterbutton'  onClick={async (e) => { if ( minterAddress ) { await addMinter();setShow(false); } } } >Add</DefaultButton>  
        </Modal>
      </div>
    );
  
}

export default AddMinterModal;
