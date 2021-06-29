import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {Panel} from 'pivotal-ui/react/panels';
import {FlexCol} from 'pivotal-ui/react/flex-grids';

const ManageCommons_Main = ({ provider, commons } ) => {

  const [balance, setBalance] = useState('')

  // ----- Get Vault  data
  const getVaultBalance = async () => {
    try {
      provider.getBalance(commons).then((data) => {
        const b = ethers.utils.formatEther(data)
        setBalance(b)
      })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getVaultBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
            <div className="panel" >
                <Panel {...{title: 'Basic', titleCols: [<FlexCol fixed></FlexCol>], style: {  padding: '8px', background: '#f2f2f2'}}}>
                <h3>Smart contract and its Ξ balance</h3>
                <h4> Commons Contract: {commons} </h4>
                <h4> Commons Balance: {balance} Ξ</h4>
    
        </Panel> </div>
  )
}

export default ManageCommons_Main
