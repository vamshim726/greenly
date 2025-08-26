import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, Leaf, Trophy, Calendar } from "lucide-react";
import html2canvas from "html2canvas";
import { format } from "date-fns";

interface ImpactCertificateProps {
  userProfile: {
    full_name: string | null;
  } | null;
  stats: {
    totalActions: number;
    totalCO2Saved: number;
    currentStreak: number;
  };
  userRank?: number;
  userPercentile?: number;
}

const ImpactCertificate: React.FC<ImpactCertificateProps> = ({ 
  userProfile, 
  stats,
  userRank,
  userPercentile
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        
        const link = document.createElement('a');
        link.download = `greenly-impact-certificate-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Error generating certificate:', error);
      }
    }
  };

  const shareCertificate = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        
        canvas.toBlob((blob) => {
          if (blob && navigator.share) {
            const file = new File([blob], 'greenly-impact-certificate.png', { type: 'image/png' });
            navigator.share({
              title: 'My Environmental Impact Certificate',
              text: `I've saved ${stats.totalCO2Saved.toFixed(2)} kg of CO₂ through ${stats.totalActions} eco-friendly actions!`,
              files: [file]
            }).catch(console.error);
          } else {
            // Fallback: copy to clipboard or download
            downloadCertificate();
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error sharing certificate:', error);
        downloadCertificate();
      }
    }
  };

  const equivalentTrees = Math.round(stats.totalCO2Saved / 21.77); // Average tree absorbs 21.77kg CO2/year
  const equivalentMiles = Math.round(stats.totalCO2Saved * 2.31); // 1kg CO2 ≈ 2.31 miles driven

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Export Impact Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Environmental Impact Certificate</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Certificate Design */}
          <div 
            ref={certificateRef}
            className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-4 border-green-200"
            style={{ minHeight: '500px' }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="bg-green-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Leaf className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                Environmental Impact Certificate
              </h1>
              <div className="text-green-600 text-base font-medium">
                Greenly • {format(new Date(), 'MMMM yyyy')}
              </div>
            </div>

            {/* Recipient */}
            <div className="text-center mb-6">
              <p className="text-gray-600 text-base mb-2">"This certifies that"</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {userProfile?.full_name || 'Eco Warrior'}
              </h2>
              <p className="text-gray-600 text-base">
                "has made a positive impact on our environment"
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white/80 border-green-200">
                <CardContent className="p-4 text-center">
                  <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-800">
                    {stats.totalCO2Saved.toFixed(2)} kg
                  </div>
                  <div className="text-green-600 font-medium text-sm">CO₂ Saved</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-800">
                    {stats.totalActions}
                  </div>
                  <div className="text-blue-600 font-medium text-sm">Eco Actions</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-orange-200">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-orange-800">
                    {stats.currentStreak}
                  </div>
                  <div className="text-orange-600 font-medium text-sm">Day Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Equivalents */}
            <div className="bg-white/60 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Environmental Impact Equivalent
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">🌳</div>
                  <div className="text-lg font-bold text-green-700">
                    {equivalentTrees} {equivalentTrees === 1 ? 'tree' : 'trees'}
                  </div>
                  <div className="text-green-600 text-sm">annual CO₂ absorption</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🚗</div>
                  <div className="text-lg font-bold text-blue-700">
                    {equivalentMiles} miles
                  </div>
                  <div className="text-blue-600 text-sm">of car emissions avoided</div>
                </div>
              </div>
            </div>

            {/* Rank (if available) */}
            {userRank && userPercentile && (
              <div className="text-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full inline-block text-sm">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  Ranked #{userRank} • Top {userPercentile}% of Eco Warriors
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-gray-500 text-xs border-t border-green-200 pt-3">
              <p>Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
              <p>"Keep up the great work making our planet greener!" 🍃</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button onClick={downloadCertificate} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
            <Button onClick={shareCertificate} variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImpactCertificate;
