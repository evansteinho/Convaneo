'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  const teamMembers = [
    { 
      name: 'Leo Dai', 
      role: 'Developer',
      image: '/images/team/LeoDai.jpg'
    },
    { 
      name: 'Conner Ryan Peterson', 
      role: 'Developer',
      image: '/images/team/connerpeterson.jpg'
    },
    { 
      name: 'Evan Steinhoff', 
      role: 'Developer',
      image: '/images/team/evansteinhoff.jpg'
    }
  ];

  return (
    <main className="relative min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-4 z-10"
        >
          <motion.h1 
            className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Convaneo
          </motion.h1>
          <motion.p 
            className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            A statically typed programming language focused on simplicity and clarity
          </motion.p>
          <motion.div 
            className="flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="https://github.com/evansteinho/Convaneo" 
                  className="px-8 py-4 rounded-lg transition-all hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-800">
              GitHub Repository
            </Link>
            <Link href="#examples" 
                  className="px-8 py-4 rounded-lg transition-all hover:scale-105 bg-gradient-to-r from-purple-700 to-blue-500 hover:from-purple-800 hover:to-blue-600">
              View Examples
            </Link>
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="relative min-h-screen flex items-center py-20">
        <div className="absolute inset-0 bg-[url('/images/story-bg.jpg')] bg-cover bg-fixed bg-center opacity-20" />
        <div className="container mx-auto px-4 z-10">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-12 text-center">Our Story</h2>
            <div className="space-y-8 text-gray-300 text-lg">
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Convaneo was born from a vision of creating a programming language that combines the power of modern features with the elegance of simplicity. Inspired by the historical roots of programming languages, we set out to create a language that would be both powerful and accessible.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Our language features a comprehensive set of modern programming tools, including static typing, built-in data structures, and powerful iteration methods. We&apos;ve carefully designed the syntax to be intuitive while maintaining the flexibility needed for complex programming tasks.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                The development of Convaneo has been driven by a commitment to creating a language that prioritizes developer experience and code clarity. We believe that programming should be both powerful and enjoyable, and Convaneo embodies this philosophy in every aspect of its design.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="relative min-h-screen py-20">
        <div className="absolute inset-0 bg-[url('/images/code-bg.jpg')] bg-cover bg-fixed bg-center opacity-10" />
        <div className="container mx-auto px-4 z-10 relative">
          <motion.h2 
            className="text-4xl font-bold mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Language Examples
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Test Function Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">Nested Control Flow</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`int test(int x, int z, int y) {
    if (x == z) { 
        while (z == y) {
            //Does Something
            int w := 5; 
            return ++w;
        }
    } else if (z == y) {
        int w := x ** y;
        return w++;
    }
}`}</code>
              </pre>
            </motion.div>

            {/* String Conversion Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">String Conversion</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`string addToString(int a, string b) {
    return b + (string) a;
}

int main() {
    print ((string) addToString(5, "Hello"));
    return 0;
}`}</code>
              </pre>
            </motion.div>

            {/* Function Operations Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">Function Operations</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`int increment(int x) {x++;}
int decrement(int x) {x--;}
int randomFunc(int x, int y) {
    int z := x * y ** x;
    if (x == 4) {z += 1;}
    return z ** x;
}`}</code>
              </pre>
            </motion.div>

            {/* Void Function Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">Void Functions</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`void doNothing(int a, string b) {
    return;
}

int main() {
    print ((string) doNothing(5, "Hello"));
    return 0;
}`}</code>
              </pre>
            </motion.div>

            {/* Recursive Function Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">Recursive Functions</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`int factorial(int n) {
    if (n == 0) { return 1; }
    return n * factorial(n - 1);
}

int main() {
    print ((string)factorial(5));
    return 0;
}`}</code>
              </pre>
            </motion.div>

            {/* Control Flow Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">Control Flow</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`int x := 0;
int y := 1;
int z := 0;
int w := 1;

if (x == y) { return x; }
else if (z > 0) { return x; }
else if (z < 0) { return y; }
else {return w;}`}</code>
              </pre>
            </motion.div>

            {/* Loop Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">For Loop</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`for (int x := 0; x < 10; x++;) {
    print(x);
}`}</code>
              </pre>
            </motion.div>

            {/* Array Operations Example */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-4">Array Operations</h3>
              <pre className="bg-gray-900/90 p-4 rounded-lg overflow-x-auto">
                <code>{`int[] returnArrayOfLength5(bool condition) {
    int[] array := int[5]();
    array[0] = 0;
    array[1] = 1;
    array[2] = 2;
    array[3] = 3;
    array[4] = 4;
    if (condition) {
        array = int[5]();
        array[0] = 4;
        array[1] = 3;
        array[2] = 2;
        array[3] = 1;
        array[4] = 0;
    }
    return array;
}`}</code>
              </pre>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative min-h-screen flex items-center py-20">
        <div className="absolute inset-0 bg-[url('/images/team-bg.jpg')] bg-cover bg-fixed bg-center opacity-20" />
        <div className="container mx-auto px-4 z-10">
          <motion.h2 
            className="text-4xl font-bold mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            The Team
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.name}
                className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg text-center shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: member.name === 'Leo Dai' ? '90% 90%' : 'center' }}
                        priority={true}
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700" />
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-400">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 bg-gray-900/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2025 Convaneo. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
} 