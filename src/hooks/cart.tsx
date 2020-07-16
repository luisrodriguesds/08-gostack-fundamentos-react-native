import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  console.log(products)

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStorage = await AsyncStorage.getItem('@GoMarketplace:products')
      if (productsStorage) {
        setProducts([...JSON.parse(productsStorage)])
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    // TODO ADD A NEW ITEM TO THE CART
    const findProduct = products.find(item => item.id === product.id)
    if(findProduct){
      setProducts(
        products.map(item => item.id === findProduct.id ? { ...item, quantity: item.quantity+1} : item)
        )
    }else{
      setProducts([...products, { ...product, quantity: 1 }])
    }

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products))
  }, [products]);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    const findProduct = products.find(item => item.id === id)
    if (findProduct) {
      setProducts(products.map(item => item.id == id ? {...item, quantity: item.quantity+1} : item))
    }
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products))
  }, [products]);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    const findProduct = products.find(item => item.id === id)
    if (findProduct.quantity <= 1) {
      // code...
      setProducts(products.filter(item => item.id !== id))
    }else{
      setProducts(products.map(item => item.id == id ? {...item, quantity: item.quantity - 1} : item))
    }
    
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products))
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
