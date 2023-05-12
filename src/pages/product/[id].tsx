import { stripe } from "@/src/lib/stripe";
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from "@/src/styles/pages/product";

import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Stripe from "stripe";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  };
}

export default function Product({ product }: ProductProps) {
  const [isCreatingChekoutSession, setIsCreatingChekoutSession] =
    useState(false);

  // const router = useRouter();

  async function handleBuyProduct() {
    try {
      setIsCreatingChekoutSession(true);

      const response = await axios.post("/api/checkout", {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = response.data;

      // router.push('/checkout')

      window.location.href = checkoutUrl;
    } catch (err) {
      setIsCreatingChekoutSession(false);

      // Datadog / Sentry
      alert("Falha ao redirecionar ao checkout!");
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image
            src={product?.imageUrl}
            alt={product?.name}
            width={520}
            height={480}
          />
        </ImageContainer>
        <ProductDetails>
          <h1>{product?.name}</h1>
          <span>{product?.price}</span>

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam quia
            esse fuga veniam, cupiditate repellendus animi explicabo illum culpa
            voluptatum.
          </p>

          <button
            disabled={isCreatingChekoutSession}
            onClick={handleBuyProduct}
          >
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: "prod_NpuPEkXeeDR8sY" } }],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params?.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
};
