import React, { useState , useEffect } from "react";
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
import Web3 from 'web3';
import SignIn from './SignIn'
import UpdateSaleForm from './UpdateSaleForm'
import SaleModal from './SaleInfoModal'


import ReactPlayer from "react-player";




import './App.css';
import 'pivotal-ui/css/modal';
import moralis from "moralis";

import MOLCOMMONS_ABI from './CONTROLLER_ABI'
import GAMMA_ABI from './GAMMA_ABI'

var web3 = new Web3(Web3.givenProvider);

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const orgaddresses = [];
function App() {

        const initialUser = moralis.User.current();
        const [user,            setUser             ] = useState(initialUser);
        const [address,         setAddress          ] = useState('Connect Wallet');
        const [chain,           setChain            ] = useState('');
        const [connect,         toggleConnect       ] = useState(false);
        const [ethPrice,        setEthPrice         ] = useState('')
        const [coinPrice,       setCoinPrice        ] = useState('')
        const [image,           setImage            ] = useState(null);
        const [createdAt,       setCreatedAt        ] = useState('');
        const [title,           setTitle            ] = useState('Title');
        const [description,     setDescription      ] = useState('Description');
        const [tokenId,         setTokenIndex       ] = useState('');

        const [royalties,       setRoyalties        ] = useState(null)
        const [creator,         setCreator          ] = useState('')

        const [price,           setPrice            ] = useState(null)
        const [coins,           setCoins            ] = useState(null)
        const [isSale,          setIsSale           ] = useState(false)
        const [owner,           setOwner            ] = useState(null)
        const [commonsAddress,  setCommonsAddress   ] = useState(0)
        const [totalFees,       setTotalFees        ] = useState()
        const [coinAddress,     setCoinAddress      ] = useState(null)
        const [form,                    setForm                 ] = useState(false)
        const [contractToUpdateSale,    setContractToUpdateSale ] = useState(null)
        const [creatorsFee,             setCreatorsFee          ] = useState(null)
        const [organizersFee,           setOrganizersFee        ] = useState(null)
        const [totalPrice,              setTotalPrice           ] = useState(null)
        const [buyError,                setBuyError             ] = useState(null)
        const [ownerMatch,              setOwnerMatch           ] = useState(null)
        const [creatorMatch,            setCreatorMatch         ] = useState(null)
        const [gammaAddress,            setGammaAddress         ] = useState(null)

        const [twitter,                 setTwitter              ] = useState(null)
        const [instagram,               setInstagram            ] = useState(null)
        const [username,                setName                 ] = useState(null)
        const [avatarImage,             setAvatarImage          ] = useState(null)
        const [airdrop,                 setAirdrop              ] = useState(null)
        const [commonsOwner,            setCommonsOwner         ] = useState(false)
        const [txHash,                  setTxHash               ] = useState()
        const [txRows,                  setTxRows               ] = useState()
        const [unlockLink,              setUnlockLink           ] = useState();
        const [extension,               setExtension            ] = useState();
        const [isVideo,                 setIsVideo              ] = useState(false);
        const [waitingMessage,          setWaitingMessage       ] = useState('')

       // var gammaAddress = '';

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const callbackFunction = (user,address) => {  setUser(user); setAddress(address);}

        const User = moralis.Object.extend( "User", {}, {} );

        const Organizer = moralis.Object.extend( "Organizer", {}, {} );

        const Avatar = moralis.Object.extend( "Avatar",  {}, {} );

        const Commons = moralis.Object.extend( "Commons", {}, {} );

        const NFT = moralis.Object.extend( "NFT", {}, {});
        
        const Holder = moralis.Object.extend( "NFTHolder", {}, 
        {
            newHolder: function(tokenId,address,) { 
                                                        const holder = new Holder();
                                                        holder.set( "tokenId",          tokenId        );
                                                        holder.set( "gammaAddress",     gammaAddress   );
                                                        holder.set( "commonsAddress",   commonsAddress );
                                                        holder.set( "accountAddress",   address        );
                                                        return holder; 
                                                  }
        });


        const getImageData = async () => {
            var imageHash =    window.location.search.substring( 6 );
            var objectId = window.location.search.substring( 6 );
            const query = new moralis.Query( NFT );
            query.equalTo( "objectId", objectId );
            const results = await query.find();
            
            if ( results.length > 0 )
            {
                let image = results[0];
                let created = image.get( "createdAt" );
                setCreatedAt( new Date( created ).toString() );
                setImage( image.get( "metadata" ).image );
                setTitle( image.get( "title" ) );
               // let ga =  image.get( "gammaAddress" );
               /// setGammaAddress( ga );
                setUnlockLink( image.get( "unLockLink" ) );
                setDescription( image.get( "description" ) );
                setTokenIndex( image.get( "tokenIndex" ) );
                setExtension( image.get('extension') );
                setIsVideo( image.get('extension') === '.mp4' )
                setTxHash( image.get( "txHash" ) );
                setCommonsAddress( image.get( "commonsAddress" ) );
            }
            else
            {   
                //TODO What?
            }

    }

        const getAirdrop = async () => {
            try {
              const _contract = new ethers.Contract(await getCommonsAddress(), MOLCOMMONS_ABI, signer)
              _contract.airdrop().then((data) => {
                const a = ethers.utils.formatEther(data)
                setAirdrop(a)
              })
            } catch (e) {
              console.log(e)
            }
          }

        const getGammaContract = async () => 
        {
            const _contract = new ethers.Contract(commonsAddress, MOLCOMMONS_ABI, signer)
            var gamma = await _contract.gamma();
            return gamma;
        }

        const getShortAddress = (address) =>
        {
            return address.substring( 0, 12 ) + '....';
        }

        const getEthTx = async (txhash) =>
        {
            const query = new moralis.Query( "EthTransactions" );
            query.equalTo( "hash", txhash );
            const results = await query.find();
            let rows = [];
            if ( results.length > 0 )
            {
                return web3.utils.fromWei( results[0].get( "value" ) );
            }
            return 0;
        }

        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const getTXInfo = async () =>
        {
            const query = new moralis.Query( "EthNFTTransfers" );
            query.equalTo( "token_id", tokenId );
            query.equalTo( "token_address", gammaAddress.toLowerCase() );
    
            //alert( tokenId +'\n\n'+gammaAddress );

            const results = await query.find();
            let rows = [];
            
            for ( var i=0; i < results.length; i++ )
            {
              //  alert( 'token id ' + results[i].get( "token_address" ) +'\n\n'+gammaAddress );
                let txvalue = await getEthTx(results[i].get( "transaction_hash" ));
                rows.push( { from: ( results[i].get( "from_address" ) == zeroAddress ? "Minted" :getShortAddress( results[i].get( "from_address" ) ) ), to: getShortAddress( results[i].get( "to_address" ) ), txhash: results[i].get( "transaction_hash" ), value: txvalue  } );
                
            }
            
            setTxRows(
                          rows.map((row,i) => <tr key={i}><td><a target="_blank" href={'https://ropsten.etherscan.io/tx/'+row.txhash}>{row.from}</a></td><td><a target="_blank" href={'https://ropsten.etherscan.io/tx/'+row.txhash}>{row.to}</a></td><td>{row.value>0?'Ξ '+ row.value:''} </td></tr> ) 
                     )


        }
        
        const getCreatorInfo = async () =>
        {
            var gamma = '';
            var tokenId = '';
            var imageHash =    window.location.search.substring( 6 );
            const query = new moralis.Query( User );
            query.equalTo( "ethAddress", creator.toLowerCase() );
            const results = await query.find();
            
            if ( results.length > 0 )
            {
                let image = results[0];
                setTwitter( image.get( "twitter" ) );
                setInstagram( image.get( "instagram" ) );
                setName( image.get( "name" ) );
            }
            const queryAvatar = new moralis.Query( Avatar );
            queryAvatar.equalTo( "owneraddress", creator.toLowerCase() );
            const avatarResults = await queryAvatar.find();
            var org;
            if ( avatarResults.length > 0 )
            {
                let image = avatarResults[0];
                setAvatarImage( 'https://gateway.pinata.cloud/ipfs/' + image.get( "image" ) );
            }
        }

    function getCommonsAddress()
    {
        const  address = process.env.REACT_APP_COMMONS_CONTRACT
        return address;
    }

    const  getGammaAddress = async () => 
    {
        const _contract = new ethers.Contract(getCommonsAddress(), MOLCOMMONS_ABI, signer)
        var gamma = await _contract.gamma();
        setGammaAddress( gamma );
        return gamma;
    }

const getCreatorFee = async () => {
    const caddress = await getCommonsAddress();
    const _contract = new ethers.Contract(caddress, MOLCOMMONS_ABI, signer)
    var total = 0;
    try {
            const data = await _contract.fees(0);
            setCreatorsFee(data)
            total = data;
            
             const data2 = await _contract.fees(1); 
              setOrganizersFee(data2)
              total += data2;
              console.log( 'setting total ? ' + total )
              const newPrice_ = ethers.utils.parseEther(price)
              const p = parseInt(newPrice_, 10)
              const priceWithFee = p + p * 0.01 * total //TODO should be checking contract for org fees
              console.log('Buyer pays a total of - ', priceWithFee)
              //setTotalPrice( web3.utils.fromWei(priceWithFee + ''));
            //  setTotalFees( web3.utils.fromWei( ( p * 0.01 * total ) + '') );
     
    } catch (e) {
      console.log(e)
    }
  }

// ----- Buy NFT with Commons coins
  const buyWithCoins = async () => {
    setBuyError('')

    const c = ethers.utils.parseEther(coinPrice.toString())
    console.log('Buyer pays a total of - ', c)
    const _contract = new ethers.Contract(commonsAddress, MOLCOMMONS_ABI, signer)

    try {
      const tx = await _contract.coinPurchase(tokenId)
      console.log('this is tx.hash for purchase', tx.hash)

      const receipt = await tx.wait()
      console.log('mint receipt is - ', receipt)
      window.location.reload()
      // contractListener(_contract)
    } catch (e) {
      console.log(e)
      const err = Math.abs(e.error.code)
      const message = e.error.message

      if (err === 32603 && message === 'execution reverted: !price') {
        setBuyError('Insufficient coins!')
      }
    }
  }


const buyWithEth = async () => {
    setBuyError('')
    console.log('Buyer pays a total of - ', price)
    
    var config = { value: web3.utils.toWei( price.toString() ) };
    var localAddress = await signer.getAddress();
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
  }


  // Add buyer to Firestore
  const addBuyerToCoinHolders = async () => {
    console.log( commonsAddress + 'adding holder' );
    signer.getAddress().then( async (address) => {
    console.log(address)
    let holder = Holder.newHolder(tokenId,address);
    await holder.save();    

    })
  }

  const isOwner = async () => {
    if (owner) { var addy = await signer.getAddress() ; 
      if (owner === await signer.getAddress() ) {
        setOwnerMatch(true)
      } else {
        console.log('Not owner of NFT')
      }
    }
  }

  const isCreator = async () => {
    if (creator) {
      if (creator.toLowerCase() === await signer.getAddress()) {
        setCreatorMatch(true)
      } else {
        console.log('Not creator of NFT')
      }
    }
  }

  const getGammaSaleData = async (gammaAddress__, tokenId_) => {
    const _contract = new ethers.Contract( gammaAddress__, GAMMA_ABI, signer)
   
    _contract
      .getSale(tokenId_)
      .then((data) => {
        setCreator(data[2].toString())
        getGammaPriceAndSale(gammaAddress__, tokenId_)
        
      })
      .catch((e) => console.log(e))
  }

  // ----- Gamma Functions (for when Gamma is out of MolVault)
  const getGammaPriceAndSale = async (gammaAddress, tokenId_) => {
    const _contract = new ethers.Contract(gammaAddress, GAMMA_ABI, signer)
    _contract
      .getSale(tokenId_)
      .then((data) => {
        const p = ethers.utils.formatEther(data[0].toString())
        setPrice(p)
        setIsSale(data[1]==0 ? false:true)
       
      })
      .catch((e) => console.log(e))
  }

  const getGammaOwner = async (gammaAddress, tokenId_) => {
    const _contract = new ethers.Contract(gammaAddress, GAMMA_ABI, signer)
    _contract
      .ownerOf(tokenId_)
      .then((data) => {
        if (data === commonsAddress) {
          setOwner('Commons')
          setCommonsOwner(true)
        } else {
          setOwner(data)
        }
      })
      .catch((e) => console.log(e))
  }

  const getGammaRoyalties = async (gammaAddress) => {
    const _contract = new ethers.Contract(gammaAddress, GAMMA_ABI, signer)
    _contract
      .royalties()
      .then((data) => {
        const r = ethers.utils.formatUnits(data, 'wei')
        setRoyalties(Math.trunc(r))
      })
      .catch((e) => console.log(e))
  }


 async function updateSale() {
    setForm(true)
    const _contract = await new ethers.Contract(gammaAddress, GAMMA_ABI, signer)
    setContractToUpdateSale(_contract) 
  }

const ethEnabled = () => {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    window.ethereum.enable();
    return true;
  }
  return false;
}

 useEffect( async () => {

    await getGammaAddress()
    await getImageData()
    if ( gammaAddress )
    {
       await getGammaSaleData(gammaAddress,tokenId)
       await getGammaOwner(gammaAddress,tokenId)
       if ( owner && ! ownerMatch )
       {
          await isOwner()
       }
      
       await getGammaRoyalties(gammaAddress)
       if ( creator )
       {
            await getCreatorInfo();
            await isCreator();
       }
       await getTXInfo();
    }
    

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId,creator,owner])



      return (
                    <div className="App full-height" > {gammaAddress && 
                        <Panel {...{title: 'NFT View', titleCols: [<FlexCol fixed><BrandButton href="/" >Home</BrandButton><SignIn callBack={callbackFunction}/></FlexCol>], style: {  height: '100%', padding: '8px', background: '#f2f2f2'}}}>
                        <Grid className="grid-show ">
                            <FlexCol fixed {...{style: {width: '25%'}}}>
                            { ! isVideo && 
                                <div><img className="nftview" src={image} /><br/><br/></div>

                             }
                            { isVideo &&
                                
                                <div>
                                    <ReactPlayer
                                     url={image}
                                      muted={true}
                                      playing={true}
                                      width="400px"
                                      loop={true}
                                    />
                                </div>
                            }
        
                                {gammaAddress && ( isSale == 1 ) && ! ownerMatch  && <BrandButton onClick={() => {  setWaitingMessage( 'Purchasing! Waiting for confirmation!' );document.getElementById('loading').style.display='block'; buyWithEth(); }} >Buy with ETH {price} Ξ</BrandButton>}<br/><br/>
                                {commonsOwner && <BrandButton onClick={buyWithCoins} >Buy with Coins {coinPrice }</BrandButton> }<br/>
                               
                            
                               
                                </FlexCol>

                            <FlexCol fixed {...{style: {width: '35%',padding: '8px'}}} >
                                 <h1>Details</h1><br/>
                                 <h2>{title}</h2><br/>
                                 <p className="description">{description}</p>
                               <br/>
                                       
                                 { isSale && 
                                 <div>                   
                                 <h3>Price Ξ {price}</h3> 
                                 <h5>Royalties {royalties}%</h5><br/>
                                 <h5>Created {createdAt}</h5>
                                 </div>}
                                

                                 <br/>

                                 <TooltipTrigger tooltip={image}>
                                 <BrandButton target="_blank" href={image} >View on IPFS</BrandButton></TooltipTrigger>
                                 <br/><br/><TooltipTrigger tooltip={'https://explorer-mumbai.maticvigil.com/tx/' + txHash}>
                                 <BrandButton target="_blank" href={'https://explorer-mumbai.maticvigil.com/tx/' + txHash} >View Transaction</BrandButton></TooltipTrigger>

                                { ( ownerMatch && unlockLink && <div><br/><br/><h3>You Own It!</h3><TooltipTrigger tooltip={unlockLink}>
                                    <BrandButton target="_blank" href={unlockLink} >High Resolution Version</BrandButton>
                                </TooltipTrigger></div> ) }

                                {(ownerMatch || (owner === 'Commons' && creatorMatch)) && ( 
                                <div>
                                  <br/>

                                <SaleModal 
                                      setForm={setForm}
                                      contract={contractToUpdateSale}
                                      tokenId={tokenId}
                                      gammaAddress={gammaAddress}
                                      commonsAddress={commonsAddress}
                                      owner={owner} 
                                      isSale={isSale}
                                      defEthPrice={price}
                                      defCoinPrice={coinPrice}
                                       />
                                </div> )}

                            </FlexCol>
                            <FlexCol>
                                <h1>Creator</h1><br/>
                                <p className="username">{username} - <span className="creator">{creator}</span></p>
                                <img className="avatarimage" src={avatarImage} /><br/><br/>

                                <a target="_blank" href={twitter}><img className="socialmediaicon" src="./twitter.png" /></a><a target="_blank" href={instagram}><img className="socialmediaicon" src="./instagram.png" /></a>
                          </FlexCol>
                          <FlexCol >
                              <div id="loading" >
                                {waitingMessage}<br/>
                                <img  src="loading.gif" />
                              </div>
                          </FlexCol>
                        </Grid>
                      </Panel> }
                    </div>
               );
}

export default App;
