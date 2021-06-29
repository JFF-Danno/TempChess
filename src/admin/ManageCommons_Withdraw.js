import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import MOLCOMMONS_ABI from '../CONTROLLER_ABI'
import {FlexCol} from 'pivotal-ui/react/flex-grids';
import {BrandButton} from 'pivotal-ui/react/buttons';
import {Panel} from 'pivotal-ui/react/panels';
import {Input} from 'pivotal-ui/react/inputs';
import Web3 from 'web3';
import moralis from "moralis";

const ManageCommons_Withdraw = ({ signer, commons }) => {
  // ----- useState
  const [numWithdrawalConfirmations, setNumWithdrawalConfirmations] = useState(
    ''
  )
  const [err, setErr] = useState(null)
  const [numConfirmationsRequired, setNumConfirmationsRequired] = useState('')

  const [availableFunds, setAvailableFunds] = useState(0)
  const [fundsToWithdraw, setFundsToWithdraw] = useState('')
const [withdrawalAddress, setWithdrawalAddress] = useState('')
        const [addressBook,                 setAddressBook          ] = useState([])
  // ----- useContext
 // const { account } = useContext(GlobalContext)
//  const { commons } = useContext(CommunityContext)

  // ----- React router config
 // const history = useHistory()
var web3 = new Web3(Web3.givenProvider);
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  
    const user = moralis.User.current();
  // ----- Get functions
  const getNumConfirmationsRequired = async () => {
    try {
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      _contract
        .confirmationCounts(0)
        .then((data) => setNumConfirmationsRequired(data))
    } catch (e) {
      console.log(e)
    }
  }

  const getConfirmWithdrawal = async () => {
    try {
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      _contract
        .confirmationCounts(1)
        .then((data) => setNumWithdrawalConfirmations(data))
    } catch (e) {
      console.log(e)
    }
  }

  const getAvailableFunds = async () => {
    const contractBalance = await provider.getBalance(commons)
    const funds = ethers.utils.formatEther(contractBalance)
    setAvailableFunds(funds)
  }

  // ----- Execution functions
  const confirmWithdrawal = async () => {
    try {
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      const tx = await _contract.confirmWithdraw()
      console.log(tx)
      tx.wait().then(() => {
        _contract
          .confirmationCounts(1)
          .then((data) => {
            setNumWithdrawalConfirmations(data)
            console.log(data)
          })
        setErr('')
      })
    } catch (e) {
      console.log(e)
      // if (e.code === 4001) {
      //   setErr('User rejected transaction!')
      // } else if (e.error.code === 4001) {
      //   setErr('User rejected transaction!')
      // } else if (Math.abs(e.error.code) === 32603) {
      //   setErr('You have already confirmed to withdraw funds from the commons!')
      // } else {
      //   setErr('Something went wrong!')
      // }
    }
  }

  const revokeWithdrawal = async () => {
    try {
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      const tx = await _contract.revokeWithdrawal()
      tx.wait().then(() => {
        _contract
          .numWithdrawalConfirmations()
          .then((data) => setNumWithdrawalConfirmations(data))
        setErr('')
      })
    } catch (e) {
      if (e.code === 4001) {
        setErr('User rejected transaction!')
      } else if (e.error.code === 4001) {
        setErr('User rejected transaction!')
      } else if (Math.abs(e.error.code) === 32603) {
        setErr('Withdrawal is not yet confirmed!')
      } else {
        setErr('Something went wrong!')
      }
    }
  }

  const executeWithdrawal = async () => {
        const fundsWithdraw = document.getElementById( 'agreedamount' ).value;
        const addressWithdraw = document.getElementById( 'agreedwithdrawal' ).value;
    if (availableFunds > fundsWithdraw) {
      const f = ethers.utils.parseEther(fundsWithdraw.toString())

      try {
       // const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
       // const tx = await _contract.executeWithdraw(f, withdrawalAddress );
         var contract = await new web3.eth.Contract( MOLCOMMONS_ABI, commons );
          contract.methods.executeWithdraw(f, addressWithdraw ).send({from:await signer.getAddress()})
       .on("transactionHash",function(hash){
              console.log(hash);
          })
       .on("confirmation", function(confirmationNr){
              console.log(confirmationNr);
             window.location.reload()
          })
       .on("receipt", async function(receipt){
              console.log(receipt);
             
         });
        
        
      } catch (e) {
        if (e.code === 4001) {
          setErr('User rejected transaction!')
        } else if (e.code === 4001) {
          setErr('User rejected transaction!')
        } else if (Math.abs(e.code) === 32603) {
          setErr('You have not confirmed withdrawal!')
        } else {
          setErr('Something went wrong!')
        }
      }
    } else {
      setErr('Please specify an appropriate amount to withdraw!')
    }
    
  }

/*
 var gammaContract = await new web3.eth.Contract( GAMMA_ABI, gammaAddress,{from:localAddress}  ); 
    gammaContract.methods.purchase( tokenId ).send(config)
       .on("transactionHash",function(hash){
              console.log(hash);
          })
       .on("confirmation", function(confirmationNr){
              console.log(confirmationNr);
              document.getElementById('loading').style.display='none';
          })
       .on("receipt", async function(receipt){
              console.log(receipt);
              await addBuyerToCoinHolders();
         });
*/


     const UserAddress = moralis.Object.extend( "UserAddress", {}, {
            newUserAddress: function(address) { 
                const userAddress = new UserAddress();
                userAddress.set( "account",     user.get("ethAddress").toLowerCase()  );
                userAddress.set( "address",     address.toLowerCase()  );
                return userAddress; 
                }
        } );

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
                                                            <button onClick={()=>{ document.getElementById('warningAddress').style.display='block'; document.getElementById('agreedwithdrawal').value=account; }}>{account}</button>
                                                        </div>
                                                      </li>  );
       setAddressBook( rows );
       
    }

  useEffect(() => {
    getAddresses()
    getAvailableFunds()
    getConfirmWithdrawal()
    getNumConfirmationsRequired()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (

 <div className="panel" >
                <Panel {...{title: 'Withdraw', titleCols: [<FlexCol fixed></FlexCol>], style: {  padding: '8px', background: '#f2f2f2'}}}>
                    <h2>Withdraw Funds from Common</h2>
                    <h3>Click 'Confirm' to vote, and withdraw when consensus is reached.</h3>
                    <h4>Funds Available to Withdraw: {availableFunds} Ξ</h4>
                    <h4>No. Confirmations Required: {numConfirmationsRequired}</h4>
                    <h4>No. Withdrawal Confirmations: {numWithdrawalConfirmations}</h4>
                  {err && ( <h4>{err}</h4> )}
                    <BrandButton onClick={confirmWithdrawal} >Confirm</BrandButton>
                    <BrandButton onClick={revokeWithdrawal} >Revoke Confirmation</BrandButton><br/>
                    <span className="label" >Agreed Withdrawal Amount&nbsp;&nbsp;</span><span id="warningAmount" ></span>
                    <Input id="agreedamount" placeholder='Agreed amount in Ξ to withdraw' onChange={(e) => {  setFundsToWithdraw(e.target.value); } } value={fundsToWithdraw} type='text'/>
                    <span className="label" >Agreed Withdrawal Address&nbsp;&nbsp;</span><span id="warningAddress" ></span>
                    <Input id='agreedwithdrawal' placeholder='Agreed withdrawal address' onChange={(e) => { setWithdrawalAddress(e.target.value) }}  type='text'/><br/>
<div id="abook">
               <img id="abookimg" src='./address-book.png' /><br/>
                <ul>
                    {addressBook}
                </ul>
            </div><br/>
                    <BrandButton onClick={executeWithdrawal} >Withdraw</BrandButton>
                </Panel>
            </div>
  )
}

export default ManageCommons_Withdraw



