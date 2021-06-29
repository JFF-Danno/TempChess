import React, { useEffect, useState, useContext } from 'react'

//import ImageUpload from './ImageUpload'

import {DefaultButton, PrimaryButton, DangerButton, BrandButton} from 'pivotal-ui/react/buttons';
import moralis from "moralis";
import { ethers } from 'ethers'
import axios from 'axios';
import MOLCOMMONS_ABI from './CONTROLLER_ABI'
import {Panel} from 'pivotal-ui/react/panels';
import {Grid, FlexCol} from 'pivotal-ui/react/flex-grids';
import {Input} from 'pivotal-ui/react/inputs';
import {Checkbox} from 'pivotal-ui/react/checkbox';
import GAMMA_ABI from './GAMMA_ABI'

import web3 from 'web3';




moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const MintNFT = () => {
  // ----- useState
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sale, setSale] = useState('')
  const [ethPrice, setEthPrice] = useState('')
  const [coinPrice, setCoinPrice] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [compliance, setCompliance] = useState(false)
  const [metadata, setMetadata] = useState(null)
  const [account, setAccount] = useState('')
  const [chain, setChain] = useState('')


  const [connect, toggleConnect] = useState(false)
  const [imageHash, setImageHash] = useState('');
  const [imageUrl, setImageUrl] = useState('upload-image.png')
  const [commonsAddress, setCommonsAddress] = useState('') 
  const [message, setMessage] = useState('') 
  const [terms, setTerms] = useState('') 
  const [address,     setAddress]     = useState('')
  const [airdrop,                 setAirdrop              ] = useState(null)
  const [collaboratorRows,setCollaboratorRows] = useState();
  const [collaborators,setCollaborators] = useState([]);
  const [collaboratorAddresses,setCollaboratorAddresses] = useState([]);
  const [collaboratorSplits,setCollaboratorSplits] = useState([]);
  const [splitAmount,setSplit] = useState('');
  const [unlockLink, setUnlockLink] = useState();
  const [extension,     setExtension] = useState();
  const [tags,   setTags] = useState([]);
  const [size,   setSize] = useState();


  const [tagsApplied,     setTagsApplied] = useState([]);
  const [tagButtons,      setTagButtons] = useState([]);


  const provider = new ethers.providers.Web3Provider(window.ethereum);
  //const initialUser = moralis.User.current()
//  const [user, setUser] = useState(initialUser)
const Commons = moralis.Object.extend( "Commons", { /* Instance methods*/ },  {  });

const NFT = moralis.Object.extend( "NFT", { /* Instance methods*/ }, 
        {  
            newNFT: function(dict,fileHash,commonsContractAddress,gammaContractAddress,supply, txHash, fileName, extension) { 
                                        const nft = new NFT();
                                        nft.set( "fileHash",        fileHash                );
                                        nft.set( "metadata",        dict                    );
                                        nft.set( "title",           title                   );
                                        nft.set( "description",     description             );
                                        nft.set( "onsale",          sale                    );
                                        nft.set( "commonsAddress",  commonsContractAddress  );
                                        nft.set( "gammaAddress",    gammaContractAddress    );
                                        nft.set( "tokenIndex",      ( supply.toNumber() + 1 )  + ''   );
                                        nft.set( "ethPrice",        ethPrice                );
                                        nft.set( "coinPrice",       coinPrice               );
                                        nft.set( "unLockLink",      unlockLink              );
                                        nft.set( "txHash",          txHash                  );
                                        nft.set( "fileName",        fileName                );
                                        nft.set( "extension",       extension               );
                                        nft.set( "tags",            tags                    );
                                        nft.set( "size",            size                    );
                                        return nft; 
                                    }
        });
        
const Tag = moralis.Object.extend( "Tag", { /* Instance methods*/ }, 
        {  
            newTag: function(newTag) { 
                                        const tag = new Tag();
                                        tag.set( "tag",       newTag );
                                        return tag; 
                                    }
        });
     



  const signer = provider.getSigner()

  const checkMintable = async () => { 

                                        //alert('check mintable' ); 
                                        if ( title != '' && description != '' && ethPrice != ''   )
                                        {
                                            //alert( 'mintable...............' ); 
                                            doMint();
                                        }
                                        else
                                        {
                                            alert( 'not mintable, need more info' );        
                                        }
                                    }


    async function getGammaAddress()
    {
        var commonsId =    window.location.search.substring( 11 );
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
        return address;
    }



//On file select (from the pop up)
	const onFileChange = event => {
        var reader;
	    setImageFile(event.target.files[0]);
        setExtension(event.target.files[0].name.substring(event.target.files[0].name.indexOf('.')));
        reader = new FileReader();
        reader.onload = function(e) { setImageUrl( e.target.result ); }
        reader.readAsDataURL(event.target.files[0]);
	};

    const doMint = async () => {
    
                                    setMessage( 'Uploading to IPFS!' );
                                    document.getElementById( 'loading' ).style.display = 'block';
                                    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
                                    let   data = new FormData();
                                    data.append("file", imageFile, imageFile.name );
                                    const res = await axios.post(   url, data, {  maxContentLength: "Infinity", 
                                                                    headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
                                                                    pinata_api_key: process.env.REACT_APP_PINATA_PUBLIC,
                                                                    pinata_secret_api_key: process.env.REACT_APP_PINATA_PRIVATE,            },   });
                                    console.log(res.data);
                                    setImageHash( res.data.IpfsHash );
                                    setImageUrl( 'https://gateway.pinata.cloud/ipfs/' + res.data.IpfsHash );
                                    setMessage( 'Successfully uploaded to IPFS. Now Minting NFT! Please Wait!' );
                                    try
                                    {           
                                         uploadAndMint(res.data.IpfsHash,imageFile.name,imageFile.name.substring( imageFile.name.indexOf( '.' ) ))
                                    } 
                                    catch (e) 
                                    { 
                                         console.log('error is - ' + e) 
                                    }
 
    }

  // ----- Upload tokenURI and Mint NFT
  const uploadAndMint = async (hash,filename,extension) => {

                                                const baseUrl = 'https://ipfs.io/ipfs/'

                                                // Add timestamp to metadata
                                                const date = new Date()
                                                const timestamp = date.getTime()
                                                const dict = { ...metadata, image: baseUrl + hash, createdAt: timestamp }
                                                console.log('tokenURI at mint is - ', dict)
                                            
                                                var contractaddress = getCommonsAddress();
                                       
                                            try {
                                                    // Mint NFT
                                                    const tokenUri = baseUrl + hash
                                                    console.log(tokenUri)
                                                    const p = ethers.utils.parseEther(ethPrice)
                                                    molCommons(p, tokenUri, contractaddress, dict, hash,filename,extension )
                                             } 
                                             catch (e) { console.log('error is - ' + e ) }
                                        }




 // ----- Mint Gamma with MolVault
   const molCommons = 
   async (price, tokenURI, commonsContractAddress, dict, fileHash,filename,extension ) => {
    console.log('MolVault contract is - ', commonsContractAddress)
    const _contract = new ethers.Contract(commonsContractAddress, MOLCOMMONS_ABI, signer)
    try{
      const gammaAddress = await getGammaAddress();
      const gamma_contract = new ethers.Contract(gammaAddress, GAMMA_ABI, signer)
      const supply = await gamma_contract.totalSupply();
      const tx = await _contract.mint( price, tokenURI, sale ? 1 :0, await signer.getAddress(), splitAmount, collaboratorAddresses, collaboratorSplits  )                                                    

      console.log('tx.hash for minting - ' + tx.hash)
      setMessage( 'Waiting for confirmation' );
 
     tx.wait().then((receipt) => { 
         console.log('mint receipt is - ', receipt)
         const newNFT = NFT.newNFT( dict, fileHash, commonsContractAddress, gammaAddress, supply, tx.hash, filename, extension );
         newNFT.save();
       }).then(() =>{ 
          document.getElementById( 'loading' ).style.display = 'none';
          setMessage( <BrandButton href={ '/deChess/wallet/' } >NFT Minted! View Here</BrandButton> );
          })
        } catch (e) {  console.log(e)  }
     }



      //  const callbackFunction = (user,address) => {  setUser(user); setAddress(address); }

    function getCommonsAddress()
    {
        const address = '0x0BEa25c01D5eA3eDBc7BD67C1270f6141F1521A7';
        return address;
    }

      useEffect(() => { getTags() }, [tags,tagsApplied])

const getTags = async () => {
    const query = new moralis.Query( Tag );
    const results = await query.find();
    var tagButtons = [];
    for ( var i = 0; i < results.length; i++ ){
      tagButtons.push( results[i].get( "tag" ) );
    }
            
   setTagButtons( tagButtons.map((tag,i) =><li className="tagButtons" key={i}><BrandButton onClick={() => { addTag(tag)} } >{tag}</BrandButton></li> ));

    }

const addTag = async (_tag) =>
{
    var tagButtons = [];
    const query = new moralis.Query( Tag );
    query.equalTo( "tag", _tag );
    const results = await query.find();
    if ( results.length === 0 )
    {
        const tagObject = Tag.newTag(_tag);
        await tagObject.save();
    }
    tags.push( _tag );
    setTagsApplied( tags.map((tag,i) =><li className="tagButtons" key={i}><BrandButton>{tag}</BrandButton></li> ));
    setTags( tags );
    
}


  return (
    <div className="App full-height" >
                        <Panel >
        <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '20%'}}}>
                { extension !== '.mp4' &&
                    <div><img id="previewImage" src={imageUrl} /><br/><br/></div>
                }
                { extension === '.mp4' &&
                     <div>             
                     </div>
                }
            </FlexCol>
            <FlexCol {...{style: {padding: '8px'}}} >
         <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >Title</span><Input placeholder='Enter Title' type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></FlexCol>
            <FlexCol />
        </Grid>
        <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >Description</span><Input placeholder='Enter Description'  type="text" value={description} onChange={(e) => setDescription(e.target.value)} /></FlexCol>
            <FlexCol />
        </Grid>
        <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><Checkbox type='Checkbox' onChange={(e) => setSale(e.target.value)} ><span>Put on sale?</span></Checkbox></FlexCol>
            <FlexCol />
        </Grid>
        <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >Price in Ξ</span><Input placeholder='Enter amount in Ξ'  type="text" value={ethPrice} onChange={(e) => setEthPrice(e.target.value)} /></FlexCol>
            <FlexCol />
        </Grid>
         <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >Collection Size</span><Input placeholder='Enter Collection Size'  type="text" value={size} onChange={(e) => setSize(e.target.value)} /></FlexCol>
            <FlexCol />
        </Grid>
        <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >Tags</span>{tagsApplied}<br/>
            </FlexCol>
            <FlexCol />
        </Grid>
        <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><Input type="file" onChange={onFileChange} /></FlexCol>
           <FlexCol></FlexCol>
        </Grid>
        <Grid className="grid-show">
            <FlexCol fixed {...{style: {width: '35%'}}}/>
            <FlexCol {...{style: {padding: '8px'}}} ><PrimaryButton onClick={(e) => {checkMintable();} } id="mintButton" >Mint</PrimaryButton><br/></FlexCol>
            <FlexCol />
        </Grid>
          </FlexCol>
            <FlexCol> 
                <Grid className="grid-show">
                <FlexCol fixed {...{style: {width: '35%'}}}/>
                <FlexCol {...{style: {padding: '8px'}}} ><BrandButton href="/" >Home</BrandButton> <br/></FlexCol>
                <FlexCol />
                </Grid><br/>
                {message}<br/><br/><div id="loading" ><img  src="loading.gif" /></div>
                <Grid className="grid-show">
                <FlexCol fixed {...{style: {width: '35%'}}}/>
                <FlexCol {...{style: {padding: '8px'}}} >
                    <form onSubmit={(e)=>{e.preventDefault();addTag(document.getElementById('newtag').value);}} >
                        <Input placeholder='Enter a new Tag' type="text" id="newtag" /><br/>  <BrandButton type="submit" >New Tag</BrandButton>
                    </form>
                </FlexCol>
                <FlexCol />
                </Grid>
                <Grid className="grid-show">
                <FlexCol fixed {...{style: {width: '35%'}}}/>
                <FlexCol {...{style: {padding: '8px'}}} ><h2>Tags</h2><ul>{tagButtons}</ul><br/></FlexCol>
                <FlexCol />
                </Grid><br/></FlexCol>
        </Grid>
     </Panel>
   </div>
  )
}

export default MintNFT
