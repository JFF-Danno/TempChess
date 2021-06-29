import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {DefaultButton, PrimaryButton, DangerButton, BrandButton} from 'pivotal-ui/react/buttons';
import {Grid, FlexCol} from 'pivotal-ui/react/flex-grids';
import {Panel} from 'pivotal-ui/react/panels';
import {Divider} from 'pivotal-ui/react/dividers';
import {Image} from 'pivotal-ui/react/images';
import {Input} from 'pivotal-ui/react/inputs';
import {Modal} from 'pivotal-ui/react/modal';
import {Checkbox} from 'pivotal-ui/react/checkbox';
import {Radio, RadioGroup} from 'pivotal-ui/react/radio';
import { ethers } from 'ethers'
import {Tooltip, TooltipTrigger} from 'pivotal-ui/react/tooltip';

import './App.css';
import 'pivotal-ui/css/modal';
import moralis from "moralis";

import GAMMA_ABI from './GAMMA_ABI'


import MOLCOMMONS_ABI from './CONTROLLER_ABI'

import Web3 from 'web3';

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const orgaddresses = [];
function App() {

        const initialUser = moralis.User.current();
        const [user,        setUser]        = useState(initialUser);
        const [clist,       setList]        = useState('');
        const [orgList,     setOrgList]     = useState('');
        const [address,     setAddress]     = useState('Connect Wallet');
        const [chain,       setChain]       = useState('');
        const [connect,     toggleConnect]  = useState(false);
        const [gamma,       setGamma]       = useState(null)
        const [commons,     setCommons]     = useState(null)
        const [gammaUris,   setGammaUris]   = useState([])
        const [imageGrid,   setImageGrid]   = useState([])
        const [isCreator,   setIsCreator]   = useState(false)
        const [isAdmin,     setIsAdmin]     = useState(false)
        const [mainTitle,   setMainTitle]    = useState('View Commons');
        const [language,   setLanguage]    = useState('ENG');
        const [mintText,   setMintText]    = useState('Mint');
        const [adminText,  setAdminText]    = useState('Admin');
        const [isSale,          setIsSale           ] = useState(false);
        const [price,           setPrice            ] = useState(null);
var web3 = new Web3(Web3.givenProvider);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const callbackFunction = (user,address) => {  setUser(user); setAddress(address);getCommons();}

        const aboutus = () => {  window.location = '/heavenly-jungle/aboutus/?commonsId=' +  window.location.search.substring( 11 ) };

        const Organizer = moralis.Object.extend( "Organizer",{}, {} );

        const Avatar = moralis.Object.extend( "Avatar", {}, {} );

        const Commons = moralis.Object.extend( "Commons", {}, {});

        const NFT = moralis.Object.extend( "NFT", {}, {});

        const PageText = moralis.Object.extend( "PageText", {}, {});
   
        var commonsAddress = '';
        const getCommons = async () =>
        {
           // var commonsAddress =  
            const query = new moralis.Query( Commons );
            query.equalTo( "contractAddress", getCommonsAddress() );
            const results = await query.find();
            var commonsObject;
            if ( results.length > 0 ) // TODO 
            { 
               
                const object = results[0];
                const listItems = <li key={0}>{object.get('name') }</li>;
                setList(listItems);
                setGamma( object.get('gammaAddress') )
                await getGammaUri( object.get('gammaAddress')  )
                setCommons( getCommonsAddress()  );
                
            }
            else
            {
                alert( 'Commons not found!' );  //TODO handle this properly
            }

          

        }



         const isOwner = async ( tokenId_) => {
             const localAddress = await signer.getAddress()
             var gammaContract = await new web3.eth.Contract( GAMMA_ABI, await getGammaAddress()  ); 
             const saleData = await gammaContract.methods.ownerOf(tokenId_).call();

             return  ( localAddress === saleData );
        }

           // ----- Get Gamma tokens
              const getGammaUri = async (gamma) => {
                
                const uris = []
                const hashes = []
                const titles = []
                const extensions = []
                const prices = []
                const objectIds = []
                const _contract = new ethers.Contract(gamma, GAMMA_ABI, signer)
                try 
                {
                    var supply = await _contract.totalSupply();
                    for (var i = 1; i <= supply.toNumber(); i++) 
                    {
                        var uri = await _contract.tokenURI(i)
                        uris.push(uri)
                        ///var objectId = window.location.search.substring( 6 );
                        const queryNFT = new moralis.Query( NFT );
                        queryNFT.equalTo( "fileHash", uri.substring( 21 ) );
                        const NFTResults = await queryNFT.find();
                        if ( NFTResults.length > 0 )
                        {
                            var tokenIndex =  NFTResults[0].get( "tokenIndex" );
                            const ownedByMe = await isOwner(tokenIndex);
                            const newprice = await getGammaPrice( gamma, tokenIndex );
                            var titleString =   NFTResults[0].get( "title" ) ? "name : " + NFTResults[0].get( "title" ) : "";
                            if (  newprice > 0 )
                            {
                                 titleString += ' -- Price ' + newprice + ' ETH,   --  owned by you? ' + ownedByMe ;
                            }
                            titles.push( titleString );
                            extensions.push( NFTResults[0].get( "extension" ) ? NFTResults[0].get( "extension" ) : 'none' );
                           objectIds.push(  NFTResults[0].id );
                            
                        }
                    }
                    setGammaUris(uris)
                                
                    const rows = uris.map((uri,index) => <li className="item txt-m" key={index}>
                                                            
                                                                
                                                                    <div className="imageItem"> 
                                                                        <span className="helper"></span><TooltipTrigger  key={index} tooltip={titles[index]}><a href={'/nftview?hash=' + objectIds[index] }>
                                                                        <img className="itemImage" src={uri} /></a></TooltipTrigger><br/>{titles[index]}<br/><a href={uri}>{uri}</a><br/>
                                                                    </div>

                                                                
                                                                
                                                            
                                                        </li>  );
                    setImageGrid(rows);
                }
                catch (e) 
                {
                  console.log(e)
                }
              }

  // ----- Gamma Functions (for when Gamma is out of MolVault)
  const getGammaPrice = async (gammaAddress, tokenId_) => {
    const _contract = new ethers.Contract(gammaAddress, GAMMA_ABI, signer)
    const saleData = await _contract.getSale(tokenId_);
    const p = ethers.utils.formatEther(saleData[0].toString())
        return p;
       
     
  }




  // ----- Check whitelist status to toggle Mint button
  const isWhitelisted = async () => {
    const _contract = new ethers.Contract(commonsAddress, MOLCOMMONS_ABI, signer)
    try {
      signer.getAddress().then((address) => {
        _contract.isMinter(address).then((data) => {
          setIsCreator(data)
        }).catch((e) => console.log(e))
      }).catch((e) => console.log(e))
    } catch (e) {
      console.log(e)
    }
  }
       const arcade = () => {  window.location = '/heavenly-jungle/arcade?commonsId=' +  window.location.search.substring( 11 ) };

        const toggleLanguage = async () => {
            var lang = user.get("lang");
            if ( lang === 'IND' ){
                user.set( "lang", "ENG" );
                await user.save();
                window.location.reload();
            }
            else {
                user.set( "lang", "IND" );
               await user.save();
                await getAlternativeText();
            }
             
            
        }

        const getText = async (key) => {
            const query = new moralis.Query( PageText );
            query.equalTo( "key", key );
            const results = await query.find();
            var text = '';
            if ( results.length > 0 )
            {
                const object = results[0];
                text = object.get( "pagetext" );
            }
            return text;
        }

        const getAlternativeText = async () => {

            setLanguage( 'IND' );
            setMainTitle( await getText( 'p2Title' ) );
            document.getElementById('organizers').innerHTML =    await getText( 'p2Organizer' );
            setMintText( await getText( 'p2Mint' ) );    
            setAdminText( await getText( 'p2Admin' ) );
            document.getElementById('home').innerHTML =    await getText( 'p2Home' );
            document.getElementById('arcade').innerHTML =    await getText( 'p2Arcade' );      
            document.getElementById('aboutus').innerHTML =    await getText( 'p2AboutUs' );                  
        }


    function getCommonsAddress()
    {
        const  address = process.env.REACT_APP_COMMONS_CONTRACT
        return address;
    }

    async function getGammaAddress()
    {
        const query = new moralis.Query( Commons );
        const commonsAddy = getCommonsAddress();
        query.equalTo( "contractAddress", commonsAddy );
        const results = await query.find();
        var address = ''; 
         if ( results.length > 0 )
         {
             let image = results[0];
             address = image.get( "gammaAddress" );
         }
        setGamma( address );
        return address;
    }


    useEffect( async () => { await getCommons();
                       if ( commonsAddress )
                       {                          
                          await isWhitelisted()

                        }
                       
                     }, [commonsAddress])

     return (
                    <div className="App full-height" > 
                        <Panel >
                         <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><BrandButton href='/mint'>Mint NFTs</BrandButton></FlexCol>
                          <FlexCol />
                        </Grid>

                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><h1>Contract Address  {gamma}</h1></FlexCol>
                          <FlexCol />
                        </Grid>

   
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '5%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><ul>
                         {imageGrid}</ul></FlexCol>
                          <FlexCol fixed {...{style: {width: '5%'}}} />
                        </Grid>
                      </Panel>
                    </div>
               );
}

export default App;
