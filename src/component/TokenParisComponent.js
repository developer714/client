// TokenPairsComponent.js
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const GET_TOKEN_PAIRS = gql`
  query GetTokenPairs {
    tokenPairs(pairs: ["Sol/USDC", "WIF/SOL", "aura/sol"]) {
      pair
      price
      dex
      volume24h
      priceUpdate5m
      historicalPriceData {
        timestamp
        price
      }
      liquidity
      isOnWatchlist
    }
  }
`;

const ADD_TO_WATCHLIST = gql`
  mutation AddToWatchlist($pair: String!) {
    addToWatchlist(pair: $pair) {
      pair
      isOnWatchlist
    }
  }
`;

const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveFromWatchlist($pair: String!) {
    removeFromWatchlist(pair: $pair) {
      pair
      isOnWatchlist
    }
  }
`;

const TokenPairsComponent = () => {
  const { loading, error, data, refetch } = useQuery(GET_TOKEN_PAIRS);
  const [addToWatchlist] = useMutation(ADD_TO_WATCHLIST);
  const [removeFromWatchlist] = useMutation(REMOVE_FROM_WATCHLIST);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); // Fetch data every 60 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleWatchlistToggle = (pair, isOnWatchlist) => {
    if (isOnWatchlist) {
      removeFromWatchlist({ variables: { pair } });
    } else {
      addToWatchlist({ variables: { pair } });
    }
    refetch();
  };

  const filteredPairs = data.tokenPairs.filter(pair =>
    pair.pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search token pairs"
        value={searchTerm}
        onChange={handleSearch}
      />
      {filteredPairs.map(pair => (
        <div key={pair.pair}>
          <h2>{pair.pair}</h2>
          <p>Price: {pair.price}</p>
          <p>DEX: {pair.dex}</p>
          <p>24-Hour Volume: {pair.volume24h}</p>
          <p>5-Minute Price Update: {pair.priceUpdate5m}</p>
          <p>Liquidity: {pair.liquidity}</p>
          <button onClick={() => handleWatchlistToggle(pair.pair, pair.isOnWatchlist)}>
            {pair.isOnWatchlist ? '★ Remove from Watchlist' : '☆ Add to Watchlist'}
          </button>
          <Line
            data={{
              labels: pair.historicalPriceData.map(data => new Date(data.timestamp)),
              datasets: [
                {
                  label: 'Price',
                  data: pair.historicalPriceData.map(data => data.price),
                  fill: false,
                  backgroundColor: 'rgba(75,192,192,0.4)',
                  borderColor: 'rgba(75,192,192,1)',
                },
              ],
            }}
            options={{
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'day',
                  },
                },
              },
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default TokenPairsComponent;