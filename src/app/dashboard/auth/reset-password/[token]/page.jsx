import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage({ params }) {
  const { token } = params;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Nueva Contraseña</h1>
          <p className="text-gray-500">Ingresa tu nueva contraseña a continuación.</p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
};
