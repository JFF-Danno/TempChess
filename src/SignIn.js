import React, { useState,  useEffect } from "react";
import {PrimaryButton} from 'pivotal-ui/react/buttons';
import { ethers } from 'ethers'
import Web3 from 'web3';
import moralis from "moralis";

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const SignIn = (props) =>
{
        var web3 = new Web3(Web3.givenProvider);
        const initialUser = moralis.User.current();
        const [user, setUser] = useState(initialUser);
        const [address, setAddress] = useState(null);
        const [chain, setChain] = useState('');
        const [connect, toggleConnect] = useState(false);
        const [account, setAccount] = useState(false);

      useEffect(() => { 
                        checkIfLoggedIn();
                        //    getAccount()
                         if ( user) 
                                    { 
                                        getNetwork()
                                        setAddress(user.get("ethAddress")) 
                                        props.callBack( user, user.get("ethAddress") );
                                    }
                          else
                         {
                          //  alert( 'Not logged in!' );
                            //getAccount()
                        }


  // eslint-disable-next-line react-hooks/exhaustive-deps 
                      }, [])


    const checkIfLoggedIn = () => {
    
        web3.eth.getAccounts(function(err, accounts){
            if (err != null) console.error("An error occurred: "+err);
            else if (accounts.length == 0) console.log("User is not logged in to MetaMask");
            else console.log("User is logged in to MetaMask");
        });

    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const onLogin = async () => {                                        
                                        await getNetwork();
                                        const user = await moralis.authenticate();
                                        props.callBack( user, user.get("ethAddress") );
                                };

    const onLogout = () => {  moralis.User.logOut(); setUser(null); };

    const getNetwork = () => {
                                    provider
                                      .getNetwork()
                                      .then((network) => {
                                        console.log('current chainId - ' + network.chainId)
                                        if (network.chainId === 100) {
                                          setChain('xDAI')
                                          toggleConnect(true)
                                        } else if (network.chainId === 4) {
                                          setChain('Rinkeby') 
                                          toggleConnect(true)
                                        } else if (network.chainId === 1) {
                                          setChain('Mainnet')
                                          toggleConnect(true)
                                        } else if (network.chainId === 3) {
                                          setChain('Ropsten')
                                          toggleConnect(true)
                                        }
                                        else if (network.chainId === 1666700000) {
                                          setChain('Harmony')
                                          toggleConnect(true)
                                        } 
                                         else if (network.chainId === 80001) {
                                          setChain('Mumbai')
                                          toggleConnect(true)
                                        } 
 else if (network.chainId === 42) {
                                          setChain('Kovan')
                                          toggleConnect(true)
                                        } else {
                                          console.log('Pick a supported blockchain!')
                                        }
                                      })
                                      .catch((err) => { alert( 'err ' + err ); console.log(err); })
                                };

      return ( <PrimaryButton onClick={onLogin} >{ ( address ? ( address.substring( 0, 6 )  + '.... on ' + chain ) : "Sign In With MetaMask" ) }</PrimaryButton> );
}
export default SignIn;
