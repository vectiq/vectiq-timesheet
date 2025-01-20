// Add XeroPayItem type if not already present
export interface XeroPayItem {
  id: string;
  EarningsRateID: string;
  Name: string;
  EarningsType: string;
  RateType: string;
  AccountCode: string;
  TypeOfUnits: string;
  IsExemptFromTax: boolean;
  IsExemptFromSuper: boolean;
  IsReportableAsW1: boolean;
  UpdatedDateUTC: string;
  CurrentRecord: boolean;
}