'use client';

import {useForm} from "react-hook-form";
import InputField from "@/components/forms/InputField";
import {Button} from "@base-ui/react";
import FooterLink from "@/components/forms/FooterLink";
import {signInWithEmail} from "@/lib/actions/auth.actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import GoogleButton from "@/components/forms/GoogleButton";
import {useEffect} from "react";

const SignIn = () => {
    const router = useRouter();

    useEffect(() => {
        const error = new URLSearchParams(window.location.search).get('error');
        if(error === 'account_not_linked'){
            toast.error('This email already has an account', {
                description: 'Sign in with your password, then link Google from your account menu.',
                duration: 10000,
            });
        }
    }, []);

    const{
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({ /* React hook */
        defaultValues: {
            email: '',
            password: ''
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if(result.success) router.push('/');
            else toast.error('Sign in failed', { description: result.error });
        } catch (e) {
            console.error(e);
            toast.error('Sign in failed', {
                description: e instanceof Error ? e.message : 'Failed to sign in.'
            });
        }
    }

    return (
        <>
            <h1 className="form-title">Welcome Back</h1>

            <div className="space-y-5 mb-5">
                <GoogleButton/>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="h-px flex-1 bg-gray-700"/>
                    or
                    <div className="h-px flex-1 bg-gray-700"/>
                </div>
            </div>

            <form onSubmit={ handleSubmit(onSubmit) } className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="socks@socks.socks"
                    register={register}
                    error={errors.email}
                    validation={{required:'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address'} } }
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{required:'Password is required', minLength:8}}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Signing In' : 'Sign In'}
                </Button>

                <FooterLink text="Don't have an account?" linkText="Create an account" href="/sign-up"/>
            </form>
        </>
    )
}
export default SignIn