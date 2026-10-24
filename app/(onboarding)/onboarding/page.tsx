'use client';

import {useRouter} from "next/navigation";
import {Button} from "@base-ui/react";
import {useForm} from "react-hook-form";
import {completeOnboarding} from "@/lib/actions/auth.actions";
import {toast} from "sonner";
import CountrySelectField from "@/components/forms/CountrySelectField";
import SelectField from "@/components/forms/SelectField";
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/constants";

const Onboarding = () => {
    const router = useRouter();

    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<OnboardingFormData>({
        defaultValues: {
            country: 'US',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: OnboardingFormData) => {
        const result = await completeOnboarding(data);

        if(result.success){
            router.replace('/');

            router.refresh();
        }else{
            toast.error('Could not save your profile', { description: result.error });
        }
    };

    return (
        <>
            <h1 className="form-title">Personalize Your Experience</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <CountrySelectField name="country" label="Country" control={control} error={errors.country} required />

                <SelectField name="investmentGoals" label="Investment Goals" placeholder="Select your investment goal"
                             options={INVESTMENT_GOALS} control={control} error={errors.investmentGoals} required />

                <SelectField name="riskTolerance" label="Risk Tolerance" placeholder="Selct your risk tolerance"
                            options={RISK_TOLERANCE_OPTIONS} control={control} error={errors.riskTolerance} required />

                <SelectField name="preferredIndustry" label="Preferred Industry" placeholder="Select your preferred industry"
                             options={PREFERRED_INDUSTRIES} control={control} error={errors.preferredIndustry} required />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Saving' : 'Start your Investing Journey' }
                </Button>
            </form>
        </>
    );
};

export default Onboarding;