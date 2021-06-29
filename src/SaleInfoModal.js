import React, {  useEffect, useState } from "react";
import {Modal} from 'pivotal-ui/react/modal';
import {Input} from 'pivotal-ui/react/inputs';
import {DefaultButton} from 'pivotal-ui/react/buttons';
import { ethers } from 'ethers'
import MOLCOMMONS_ABI from './CONTROLLER_ABI'
import GAMMA_ABI from './GAMMA_ABI'

const SaleInfoModal = ({ setForm, contract, tokenId, gammaAddress, commonsAddress, owner, isSale, defEthPrice, defCoinPrice }) => {

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const [show,                    setShow                 ] = useState(false)
        const [contractToUpdateSale,    setContractToUpdateSale ] = useState(null)
        const [sale,                    setSale                 ] = useState(false)
        const [ethPrice,                setEthPrice             ] = useState('')
        const [coinPrice,               setCoinPrice            ] = useState('')
        const [waitingMessage,          setWaitingMessage       ] = useState('')


  const doUpdate = async (e) => {
    
    console.log(contractToUpdateSale.address, gammaAddress)
    console.log('update gamma from vault')
    updateGammaSale()
  }

  // ----- Update sale for when Gamma leaves MolCommons
  const updateGammaSale = async () => {
    try {
      const p = ethers.utils.parseEther(ethPrice)
      const tx = await contractToUpdateSale.updateSale(p, tokenId, sale?1:0)
      console.log('this is tx.hash for updating sale', tx.hash)

      const receipt = await tx.wait()
      console.log('update sale receipt is - ', receipt)
      window.location.reload()
    } catch (e) {
      console.log(e.message)
    }
  }





    async function updateSale() {
        
        if (owner !== 'Commons') {
          const _contract = await new ethers.Contract(gammaAddress, GAMMA_ABI, signer)
          setContractToUpdateSale(_contract)
        } else {
          const _contract = await new ethers.Contract(commonsAddress, MOLCOMMONS_ABI, signer)
          setContractToUpdateSale(_contract)
        }
    }


     useEffect(() => {
            setSale( isSale );
    }, [])
 
    return (
      <div>
      <DefaultButton onClick={() => { updateSale();setShow(true);}}>Update Sale</DefaultButton>
        <Modal 
                
                title="Update Sales Data!"
                size="30%"
                show={show}
                onHide={() => setShow(false)}                >
         <div>
          {waitingMessage}<br/><div id="loading" ><img  src="loading.gif" /></div>
          <label htmlFor='sale'>Put on sale?</label>
          <br />
         <Input type='Checkbox' 
                       defaultChecked={isSale}
                       onChange={(e) => {
                                            setSale(e.target.checked);
                                            if ( ! e.target.checked ){setEthPrice('0');
                                            document.getElementById('eth').value=0;}
                                         else{document.getElementById('eth').value='';}
                                         }
                                }
          />
        </div>

        <div>
          <label htmlFor='price'>Price in Ξ</label>
          <br />
          <input
            type='text'
            placeholder='Enter amount in Ξ'
            onChange={(e) => setEthPrice(e.target.value)}
            id='eth'
          />
        </div><br/>
<DefaultButton onClick={async (e) => {  setWaitingMessage( 'Updating! Waiting for confirmation!' );document.getElementById('loading').style.display='block';await doUpdate(); } } >Update</DefaultButton>  
        </Modal>
      </div>
    );
  
}

export default SaleInfoModal;
