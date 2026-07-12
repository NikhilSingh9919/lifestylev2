'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: Record<string, FAQItem[]> = {
  'pomafloss model 2.0': [
    {
      question: 'what is included in the box?',
      answer: 'One portable water flosser, one USB-C to magnetic charging cable, two standard nozzles, and one user manual.'
    },
    {
      question: 'how do i charge pomafloss before first use?',
      answer: 'Connect the magnetic cable to the charging port and the USB-C end to a compatible 5V/1A power adapter. Fully charge before first use.'
    },
    {
      question: 'how long does pomafloss take to charge?',
      answer: 'Approximately 2 hours.'
    },
    {
      question: 'how long does the battery last?',
      answer: 'At least 10 days per charge under typical use.'
    },
    {
      question: 'how much water does the tank hold?',
      answer: 'Up to 150 mL.'
    },
    {
      question: 'what pressure settings are available?',
      answer: 'Four pressure levels, from lower-pressure cleaning to stronger water pressure.'
    },
    {
      question: 'what is pulse mode?',
      answer: 'Intermittent water flow for a massage effect. It can be activated by pressing the power button once during standby or operation.'
    },
    {
      question: 'how do i use the pomafloss?',
      answer: 'Fill the tank, attach it securely, insert a nozzle until it clicks, select a pressure level, and clean between teeth and along the gumline.'
    },
    {
      question: 'does pomafloss turn off automatically?',
      answer: 'Yes. It powers off after 2 minutes of continuous operation.'
    },
    {
      question: 'what is flight mode used for?',
      answer: 'It disables the buttons to prevent accidental activation during travel. Hold the mode button for 2 seconds to toggle it.'
    },
    {
      question: 'how does the uv-c hygiene cycle work?',
      answer: 'After use, empty and reattach the tank. The UV-C cycle activates automatically for 60 seconds.'
    },
    {
      question: 'how often should i replace the nozzles?',
      answer: 'Every 6 months.'
    }
  ],
  'pomabrush model 2.0': [
    {
      question: 'what is included in the box?',
      answer: 'Each Pomabrush set includes one sonic electric toothbrush handle with a brush head pre-installed, one additional brush head, one portable charging case with UV-C hygiene cycle, one USB-C to magnetic charging cable, and one user manual.'
    },
    {
      question: 'how do i charge the pomabrush before first use?',
      answer: 'Fully charge the portable charging case first using the USB-C to magnetic charging cable. Then place the toothbrush handle inside the case, close the lid securely, and allow the handle to charge.'
    },
    {
      question: 'how long does the pomabrush battery last?',
      answer: 'Approximately 30 days, based on two 2-minute brushing sessions per day.'
    },
    {
      question: 'how long does it take to charge?',
      answer: 'The toothbrush handle takes about 3 hours to fully charge. The charging case takes about 6 hours.'
    },
    {
      question: 'what brushing modes does pomabrush have?',
      answer: 'Cleaning, Whitening, and Massage.'
    },
    {
      question: 'how do i change brushing modes?',
      answer: 'Press the power button to turn it on, then press again within 3 seconds to cycle modes. The LED ring color shows the active mode.'
    },
    {
      question: 'does pomabrush have a brushing timer?',
      answer: 'Yes. It has a 2-minute auto shut-off timer with 30-second interval pulses.'
    },
    {
      question: 'what does the red flashing light mean while brushing?',
      answer: 'It may mean too much pressure is being applied, or it may indicate low battery.'
    },
    {
      question: 'is the pomabrush waterproof?',
      answer: 'The toothbrush handle is IPX7 rated and can be rinsed or used in the shower. The charging case is not waterproof.'
    },
    {
      question: 'how does the uv-c hygiene cycle work?',
      answer: 'When the toothbrush is placed in the case and the lid is closed, the UV-C cycle runs automatically for 2 minutes.'
    },
    {
      question: 'how often should i replace the brush head?',
      answer: 'Every 3 months, or sooner if the bristles become frayed.'
    },
    {
      question: 'can i charge the toothbrush without the case?',
      answer: 'Yes. It can be charged directly with the USB-C to magnetic cable, though the case is recommended.'
    }
  ],
  'pomabrush advanced brush heads': [
    {
      question: 'what is included in the pack?',
      answer: 'Four Advanced Nylon-Silicone Brush Heads.'
    },
    {
      question: 'which toothbrushes are these brush heads compatible with?',
      answer: 'All Pomabrush models.'
    },
    {
      question: 'how long does each brush head last?',
      answer: 'Up to 3 months, so a 4-pack provides up to 1 year of use.'
    },
    {
      question: 'what are the bristles made from?',
      answer: 'Soft, charcoal-infused nylon inner bristles with antimicrobial silicone outer bristles.'
    },
    {
      question: 'what is the benefit of the w-shaped bristle pattern?',
      answer: 'It helps the bristles reach deeper between teeth and along the gumline.'
    },
    {
      question: 'are the brush heads gentle on gums?',
      answer: 'Yes. The silicone outer edges gently massage gums while supporting thorough cleaning.'
    }
  ],
  'shipping': [
    {
      question: 'how long does shipping usually take?',
      answer: 'Usually 5 to 7 business days, depending on customs and local courier services.'
    },
    {
      question: 'i have not received my order.',
      answer: 'If the order has not arrived within the estimated delivery time, Poma will contact the dispatch warehouse and provide an update. They ask customers to contact them with the order number.'
    },
    {
      question: 'can i use a courier of my choice?',
      answer: 'Yes, depending on the country. Customers should inform Poma in advance.'
    }
  ],
  'payment': [
    {
      question: 'which payment methods do you accept?',
      answer: 'Visa, Mastercard, American Express, Discover, Diners Club, JCB, and China UnionPay via Stripe.'
    },
    {
      question: 'do you accept paypal?',
      answer: 'No, PayPal is not currently accepted.'
    }
  ],
  'warranty and replacement': [
    {
      question: 'how long is the warranty?',
      answer: 'Poma Lifestyle devices include a 2-year warranty from the date of purchase, covering defects in materials or workmanship under normal use.'
    },
    {
      question: 'my pomabrush is out of warranty. can i get a discount?',
      answer: 'Usually no, but Poma says they may still be able to assist if contacted.'
    },
    {
      question: 'can you send a warranty replacement to another country different from the one i purchased from?',
      answer: 'No. Warranty replacements can only be processed within the country of original purchase.'
    }
  ]
};

export default function FAQPage() {
  const categories = Object.keys(FAQ_DATA);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  // When switching categories, automatically open the first item
  useEffect(() => {
    setOpenIndex(0);
  }, [activeCategory]);

  const currentFAQs = FAQ_DATA[activeCategory] || [];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full px-5 md:px-[80px] py-10 md:py-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Header, Description, and Category Filter Pills */}
          <div className="lg:col-span-6 lg:sticky lg:top-[160px] self-start flex flex-col justify-start">
            <h1 className="text-[32px] md:text-[60px] leading-[1.1] font-bold text-neutral-900 tracking-tight font-sans lowercase">
              frequently asked <br /> questions
            </h1>
            <p className="mt-4 text-neutral-500 text-[15px] md:text-[17px] leading-relaxed max-w-[420px]">
              Clear answers to common questions about our products, orders, and support.
            </p>
            
            {/* Category Pills Container */}
            <div className="flex overflow-x-auto no-scrollbar md:flex-wrap gap-2.5 mt-8 max-w-[450px] w-full pb-2 md:pb-0">
              {categories.map((category) => {
                const isActive = category === activeCategory;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-[18px] py-[10px] rounded-full text-sm font-medium transition-all duration-200 select-none cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-neutral-950 text-white border border-neutral-950 font-semibold'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive FAQ Accordions */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {currentFAQs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={faq.question}
                      className="border border-neutral-200/80 rounded-[14px] bg-white hover:border-neutral-300 transition-colors duration-200 overflow-hidden"
                    >
                      <button
                        onClick={() => handleToggle(index)}
                        className={`w-full px-6 pt-5 flex items-center justify-between text-left cursor-pointer group ${
                          isOpen ? 'pb-2 md:pb-3' : 'pb-5'
                        }`}
                      >
                        <span className="text-[16px] md:text-[17px] font-semibold text-neutral-900 font-sans lowercase">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-neutral-500 transition-transform duration-300 flex-shrink-0 ml-4 ${
                            isOpen ? 'rotate-180 text-neutral-900' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                              open: { opacity: 1, height: 'auto' },
                              collapsed: { opacity: 0, height: 0 }
                            }}
                            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                          >
                            <div className="px-6 pb-6 pt-0 text-[14px] md:text-[15px] leading-relaxed text-neutral-500 font-sans max-w-[620px]">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
