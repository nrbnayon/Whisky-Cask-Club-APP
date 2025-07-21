// app\(screen)\privacy-policy.tsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className='mb-6'>
      <Text className='text-lg font-semibold text-gray-800 mb-3'>{title}</Text>
      <Text className='text-gray-600 leading-6'>{children}</Text>
    </View>
  );

  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className='flex-row items-center px-5 py-2 border-b border-gray-100'>
          <TouchableOpacity onPress={() => router.back()} className='mr-2'>
            <ArrowLeft size={24} color='#374151' />
          </TouchableOpacity>
          <Text className='text-gray-800 text-xl font-medium'>
            Privacy Policy
          </Text>
        </View>

        <View className='px-5 py-6'>
          <Text className='text-2xl font-bold text-gray-800 mb-2'>
            Privacy Policy
          </Text>
          <Text className='text-gray-500 mb-8'>Last updated: January 2025</Text>

          <Section title='1. Information We Collect'>
            We collect information you provide directly to us, such as when you
            create an account, make a purchase, or contact us for support. This
            may include your name, email address, phone number, payment
            information, and investment preferences.
          </Section>

          <Section title='2. How We Use Your Information'>
            We use the information we collect to provide, maintain, and improve
            our services, process transactions, send you technical notices and
            support messages, and communicate with you about products, services,
            and promotional offers.
          </Section>

          <Section title='3. Information Sharing'>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties without your consent, except as
            described in this policy. We may share your information with trusted
            service providers who assist us in operating our platform.
          </Section>

          <Section title='4. Data Security'>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction. However, no method of transmission over the internet is
            100% secure.
          </Section>

          <Section title='5. Your Rights'>
            You have the right to access, update, or delete your personal
            information. You may also opt out of certain communications from us.
            To exercise these rights, please contact us using the information
            provided below.
          </Section>

          <Section title='6. Cookies and Tracking'>
            We use cookies and similar tracking technologies to enhance your
            experience on our platform. You can control cookie settings through
            your browser preferences.
          </Section>

          <Section title='7. Third-Party Services'>
            Our platform may contain links to third-party websites or services.
            We are not responsible for the privacy practices of these third
            parties and encourage you to review their privacy policies.
          </Section>

          <Section title="8. Children's Privacy">
            Our services are not intended for children under 18 years of age. We
            do not knowingly collect personal information from children under
            18.
          </Section>

          <Section title='9. International Transfers'>
            Your information may be transferred to and processed in countries
            other than your own. We ensure appropriate safeguards are in place
            to protect your information during such transfers.
          </Section>

          <Section title='10. Changes to This Policy'>
            We may update this privacy policy from time to time. We will notify
            you of any material changes by posting the new policy on our
            platform and updating the &rdquo;Last updated&rdquo; date.
          </Section>

          <Section title='11. Contact Us'>
            If you have any questions about this privacy policy or our data
            practices, please contact us at:
            {"\n\n"}
            Email: privacy@whiskycaskclub.com
            {"\n"}
            Phone: +1 (555) 123-4567
            {"\n"}
            Address: 123 Whisky Lane, Edinburgh, Scotland
          </Section>

          <View className='bg-gray-50 rounded-md p-4 mt-6'>
            <Text className='text-sm text-gray-600 text-center'>
              By using our services, you acknowledge that you have read and
              understood this Privacy Policy and agree to the collection and use
              of your information as described herein.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
