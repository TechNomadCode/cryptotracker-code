"use client";

import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {getCurrentPrice} from '@/services/pyth-network';
import {useEffect, useState} from 'react';
import {cn} from "@/lib/utils";
import {Icons} from "@/components/icons";
import {TransactionForm} from "@/components/transaction-form";
import {Button} from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PriceData {
  price: number;
  confidence: number;
  timestamp: number;
}

interface Holding {
  asset: string;
  quantity: number;
  currentPrice: number;
  currentValue: number;
}

interface Transaction {
  id: string;
  asset: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
}

const EXAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    asset: 'BTC',
    type: 'buy',
    amount: 0.01,
    price: 20000,
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: '2',
    asset: 'ETH',
    type: 'buy',
    amount: 0.1,
    price: 1500,
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: '3',
    asset: 'BTC',
    type: 'sell',
    amount: 0.005,
    price: 22000,
    timestamp: Date.now() - 86400000,
  },
];

export default function Home() {
  const [btcPrice, setBtcPrice] = useState<PriceData | null>(null);
  const [ethPrice, setEthPrice] = useState<PriceData | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(EXAMPLE_TRANSACTIONS);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      const btc = await getCurrentPrice('Bitcoin'); // Replace with actual Pyth ID
      const eth = await getCurrentPrice('Ethereum'); // Replace with actual Pyth ID
      setBtcPrice(btc);
      setEthPrice(eth);
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    // Calculate holdings based on transactions
    const calculatedHoldings: { [asset: string]: number } = {};
    transactions.forEach((transaction) => {
      if (transaction.type === 'buy') {
        calculatedHoldings[transaction.asset] =
          (calculatedHoldings[transaction.asset] || 0) + transaction.amount;
      } else if (transaction.type === 'sell') {
        calculatedHoldings[transaction.asset] =
          (calculatedHoldings[transaction.asset] || 0) - transaction.amount;
      }
    });

    // Create holding objects
    const newHoldings: Holding[] = [];
    for (const asset in calculatedHoldings) {
      let currentPrice = 0;
      if (asset === 'BTC') {
        currentPrice = btcPrice?.price || 0;
      } else if (asset === 'ETH') {
        currentPrice = ethPrice?.price || 0;
      }

      newHoldings.push({
        asset,
        quantity: calculatedHoldings[asset],
        currentPrice,
        currentValue: calculatedHoldings[asset] * currentPrice,
      });
    }

    setHoldings(newHoldings);
  }, [transactions, btcPrice, ethPrice]);

  const totalPortfolioValue = holdings.reduce((acc, holding) => acc + holding.currentValue, 0);

  // Calculate total profit and loss
  const totalPnL = holdings.reduce((acc, holding) => {
    const buyTransactions = transactions.filter(
      (tx) => tx.asset === holding.asset && tx.type === 'buy'
    );
    const sellTransactions = transactions.filter(
      (tx) => tx.asset === holding.asset && tx.type === 'sell'
    );

    const totalBuyValue = buyTransactions.reduce((sum, tx) => sum + tx.amount * tx.price, 0);
    const totalSellValue = sellTransactions.reduce((sum, tx) => sum + tx.amount * tx.price, 0);

    const currentHoldingValue = holding.quantity * holding.currentPrice;
    return acc + currentHoldingValue + totalSellValue - totalBuyValue;
  }, 0);

  const totalPnLPercentage = totalPortfolioValue > 0 ? (totalPnL / totalPortfolioValue) * 100 : 0;

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions([
      ...transactions,
      {
        ...transaction,
        id: Math.random().toString(36).substring(7),
      } as Transaction,
    ]);
  };

  return (
    <div className="container mx-auto p-4">
      {/* P&L Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Portfolio Value</CardTitle>
            <CardDescription>As of {new Date().toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent>
            ${totalPortfolioValue.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Profit & Loss</CardTitle>
            <CardDescription>Compared to initial investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(totalPnL > 0 ? "text-positive" : "text-negative")}>
              ${totalPnL.toFixed(2)} ({totalPnLPercentage.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Holdings Dashboard</CardTitle>
          <CardDescription>Your current asset allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Current Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.asset}>
                  <TableCell>{holding.asset}</TableCell>
                  <TableCell>{holding.quantity.toFixed(4)}</TableCell>
                  <TableCell>${holding.currentPrice.toFixed(2)}</TableCell>
                  <TableCell>${holding.currentValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button size="sm" onClick={() => setShowTransactionForm(!showTransactionForm)}>
            {showTransactionForm ? 'Close Form' : 'Add Transaction'}
          </Button>
        </CardHeader>
        <CardContent>
          {showTransactionForm && (
            <TransactionForm
              onSubmit={(transaction) => {
                addTransaction(transaction);
                setShowTransactionForm(false);
              }}
              onCancel={() => setShowTransactionForm(false)}
            />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date/Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.asset}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>${transaction.price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(transaction.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
