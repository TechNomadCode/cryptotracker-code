"use client";

import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface TransactionFormProps {
  onSubmit: (transaction: { asset: string; type: 'buy' | 'sell'; amount: number; price: number; timestamp: number }) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({onSubmit, onCancel}) => {
  const [asset, setAsset] = useState('BTC');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(Date.now());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({asset, type, amount, price, timestamp});
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <Label htmlFor="asset">Asset</Label>
        <Select onValueChange={setAsset} defaultValue={asset}>
          <SelectTrigger id="asset">
            <SelectValue placeholder="Select asset"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
            <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={(value) => setType(value as 'buy' | 'sell')} defaultValue={type}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          required
        />
      </div>
      <div>
        <Label htmlFor="timestamp">Date/Time</Label>
        <Input
          type="datetime-local"
          id="timestamp"
          value={new Date(timestamp).toISOString().slice(0, 16)}
          onChange={(e) => setTimestamp(new Date(e.target.value).getTime())}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};
