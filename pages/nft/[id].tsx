import React, { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  useMetamask,
  useAddress,
  useDisconnect,
  useContract,
  useNFTs,
  ThirdwebNftMedia,
  Web3Button,
  ThirdwebNftMediaProps,
} from "@thirdweb-dev/react";
import "react-lazy-load-image-component/src/effects/blur.css";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { sanityClient, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";

interface Props {
  collection: Collection;
}

function NFTDropPage({ collection }: Props) {
  const [claimedSupply, setClaimedSuppply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [priceInEth, setPriceInEth] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  // Auth
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();
  const nftDrop = useContract(collection.address, "nft-drop").contract;

  // get all the nfts
  const { data: nfts, isLoading: isReadingNfts } = useNFTs(nftDrop);
  console.log("nfts", nfts);

  useEffect(() => {
    if (!nftDrop) return;

    const fetchPrice = async () => {
      const claimCondition = await nftDrop.claimConditions.getAll();
      setPriceInEth(claimCondition[0].currencyMetadata.displayValue);
    };

    fetchPrice();
  }, [nftDrop]);

  // useEffect hook to get the total supply and claimed supply
  useEffect(() => {
    if (!nftDrop) return;

    const fetchNFTDropData = async () => {
      setLoading(true);

      const claimed = await nftDrop.getAllClaimed();
      const unClaimed = await nftDrop.getAllUnclaimed();
      const total = await nftDrop.totalSupply();
      console.log(claimed, unClaimed, total.toNumber());

      setClaimedSuppply(claimed.length);
      setTotalSupply(total);

      setLoading(false);
    };

    fetchNFTDropData();
  }, [nftDrop]);

  // mint NFT function
  const mintNFT = () => {
    if (!nftDrop || !address) return;

    const quantity = 1;

    setLoading(true);
    const notification = toast.loading("Minting NFT...", {
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });

    nftDrop
      .claimTo(address, quantity)
      .then(async (tx) => {
        const receipt = await tx[0].receipt;
        const claimedTokenId = await tx[0].id;
        const claimedNft = await tx[0].data();

        console.log(receipt, claimedTokenId, claimedNft);

        toast("HOORAY.. You Successfully Minted NFT", {
          duration: 8000,
          style: {
            background: "green",
            color: "white",
            fontWeight: "bolder",
            fontSize: "17px",
            padding: "20px",
          },
        });
      })
      .catch((err) => {
        console.log(err);
        toast("Whooops.. Something went wrong", {
          style: {
            background: "red",
            color: "white",
            fontWeight: "bolder",
            fontSize: "17px",
            padding: "20px",
          },
        });
      })
      .finally(() => {
        setLoading(false);
        toast.dismiss(notification);
      });
  };

  // const ShowMintedNftPopUpModal = () => {
    
  // }
  return (
    <div className="flex h-screen flex-col lg:grid grid-cols-10">
      <Toaster position="bottom-center" />
      {/* Left */}
      <div className="lg:col-span-4 bg-gradient-to-br from-cyan-800 to-rose-500">
        <div className="h-full flex flex-col items-center justify-center lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
            <LazyLoadImage
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72 user-select-none"
              draggable={false}
              src={urlFor(collection?.previewImage).url()}
              placeholderSrc="https://links.papareact.com/8sg"
              alt=""
              effect="blur"
            />
          </div>
          <div className="text-center p-5 space-y-2">
            <h1 className="text-4xl font-bold text-white">
              {collection?.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection?.description}</h2>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col flex-1 p-12 lg:col-span-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href={"/"}>
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The{" "}
              <span className="font-extrabold underline decoration-pink-600/50">
                PAPAFAM
              </span>{" "}
              NFT Market Place
            </h1>
          </Link>

          <button
            onClick={!address ? connectWithMetamask : disconnect}
            className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base"
          >
            {address ? "Sign out" : "Sign In"}
          </button>
        </header>

        <hr className="my-2 border" />
        {address && (
          <p className="text-center text-sm text-rose-400 mb-6">
            You're logged in with wallet {address.substring(0, 5)}...
            {address?.substring(address.length - 5)}
          </p>
        )}

        {/* Body */}
        {/* {nfts && nfts.length > 0 && (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                {collection?.nftCollectionName}
              </h1>
              <p className="text-sm text-gray-300">
                {claimedSupply} / {totalSupply?.toNumber()}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center">
              {nfts.map((nft, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center space-y-2"
                >
                  <ThirdwebNftMedia
                    key={nft.metadata.id}
                    metadata={nft.metadata}
                    height={200}
                  />
                  <button
                    onClick={() => mintSpecificNFT(nft.metadata.id)}
                    className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base"
                  >
                    Mint
                  </button>
                    
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Content */}
        <div className="flex flex-col flex-1 items-center space-y-6 lg:space-y-0 lg:justify-center">
          <LazyLoadImage
            className="w-80 object-cover pb-10 lg:h-40 mx-auto"
            draggable={false}
            src={urlFor(collection?.mainImage).url()}
            alt=""
            effect="blur"
          />

          <h1 className="text-3xl text-center font-bold lg:text-5xl lg:font-extrabold">
            {collection.title}
          </h1>

          {loading ? (
            <p className="pt-2 text-xl text-green-500 animate-pulse">
              Loading Supply Count...
            </p>
          ) : (
            <p className="pt-2 text-xl text-green-500">
              {claimedSupply} / {totalSupply?.toNumber()} NFT's claimed
            </p>
          )}

          {loading && (
            <img
              className="h-24 pt-10 w-80 object-cover"
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt=""
            />
          )}
        </div>

        {/* Mint Button */}
        <button
          disabled={
            loading || claimedSupply === totalSupply?.toNumber() || !address
          }
          onClick={mintNFT}
          className="h-16 w-full text-center bg-red-600 text-white rounded-full mt-10 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>Loading</>
          ) : claimedSupply === totalSupply?.toNumber() ? (
            <>Sold Out</>
          ) : !address ? (
            <>Sign in to Mint</>
          ) : (
            <span className="font-bold">Mint NFT ({priceInEth} ETH)</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({
  params,
}: GetServerSidePropsContext) => {
  const query = `
  *[_type=="collection" && slug.current == $id][0] {
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
      asset
    },
    previewImage {
    asset
    },
    slug {
      current
    },
    creator-> {
      _id, 
      name, 
      address,
      slug {
      current
    }
    }
  
  }
  `;

  const collection = await sanityClient.fetch(query, { id: params?.id });

  if (!collection) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection,
    },
  };
};
